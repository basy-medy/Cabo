// cabo.js
// BRUTALIST TECH AESTHETIC
// High contrast, monospace, industrial design system
// Colors: Neon Yellow, Black, Cream, Red Coral, Green

const playerColors = [
    "#0A0A0A", // Black - Player 1
    "#FF4D4D", // Red Coral - Player 2
    "#50C878", // Green - Player 3
    "#2d2d2d", // Dark Gray - Player 4
    "#D9D936"  // Dark Yellow - Player 5
];

class CaboGame {
    constructor() {
        this.players = [];
        this.currentRound = 1;
        this.roundHistory = [];
        this.nextPlayerId = 1;
        this.gameEnded = false;

        // DOM Elements
        this.playerNameInput = document.getElementById("playerName");
        this.addPlayerBtn = document.getElementById("addPlayer");
        this.playerList = document.getElementById("playerList");
        this.startGameBtn = document.getElementById("startGame");
        this.setupSection = document.getElementById("setupSection");
        this.gameSection = document.getElementById("gameSection");
        this.currentRoundSpan = document.getElementById("currentRound");
        this.inputRoundNumber = document.getElementById("inputRoundNumber");
        this.nextRoundBtn = document.getElementById("nextRound");
        this.resetGameBtn = document.getElementById("resetGame");
        this.leaderboardList = document.getElementById("leaderboardList");
        this.playerInputs = document.getElementById("playerInputs");
        this.historyList = document.getElementById("historyList");
        this.winnerModal = document.getElementById("winnerModal");
        this.winnerName = document.getElementById("winnerName");
        this.winnerScore = document.getElementById("winnerScore");
        this.winnerRankings = document.getElementById("winnerRankings");
        this.closeWinnerModalBtn = document.getElementById("closeWinnerModal");
        this.gameEndedBanner = document.getElementById("gameEndedBanner");

        this.bindEvents();
        this.loadGame();
    }

    bindEvents() {
        this.addPlayerBtn.addEventListener("click", () => this.addPlayer());
        this.playerNameInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.addPlayer();
        });
        this.startGameBtn.addEventListener("click", () => this.startGame());
        this.nextRoundBtn.addEventListener("click", () => this.finishRound());
        this.resetGameBtn.addEventListener("click", () => this.resetGame());
        this.closeWinnerModalBtn.addEventListener("click", () => this.resetGame());

        // Close modal on backdrop click
        this.winnerModal.addEventListener("click", (e) => {
            if (e.target === this.winnerModal) {
                this.resetGame();
            }
        });

        // Escape key to close modal
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.winnerModal.classList.contains("active")) {
                this.resetGame();
            }
        });
    }

    addPlayer() {
        const name = this.playerNameInput.value.trim();
        if (!name) return;

        if (this.players.length >= 5) {
            this.showToast("Maximum 5 players allowed in Cabo!");
            return;
        }

        if (this.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
            this.showToast("Player name already exists!");
            return;
        }

        const player = {
            id: this.nextPlayerId++,
            name,
            color: playerColors[this.players.length % playerColors.length],
            scores: [],
            totalScore: 0
        };

        this.players.push(player);
        this.playerNameInput.value = "";
        this.playerNameInput.focus();
        this.renderPlayerList();
        this.saveGame();
    }

    removePlayer(id) {
        this.players = this.players.filter((p) => p.id !== id);
        this.players.forEach((p, i) => {
            p.color = playerColors[i % playerColors.length];
        });
        this.renderPlayerList();
        this.saveGame();
    }

    renderPlayerList() {
        this.playerList.innerHTML = "";
        this.players.forEach((player, index) => {
            const tag = document.createElement("div");
            tag.className = "player-tag";
            tag.style.animationDelay = `${index * 50}ms`;
            tag.innerHTML = `
                <span style="color: ${player.color}">●</span>
                <span>${player.name}</span>
                <button class="remove-btn" onclick="game.removePlayer(${player.id})" aria-label="Remove ${player.name}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            this.playerList.appendChild(tag);
        });

        this.startGameBtn.style.display = this.players.length >= 2 ? "inline-flex" : "none";
        if (this.players.length >= 2) {
            this.startGameBtn.classList.add("animate-slide-up");
        }
    }

    startGame() {
        if (this.players.length < 2) return;

        this.setupSection.style.display = "none";
        this.gameSection.style.display = "block";
        this.renderPlayerInputs();
        this.saveGame();

        // Trigger graph draw after transition
        setTimeout(() => this.drawGraph(), 100);
    }

    renderPlayerInputs() {
        this.playerInputs.innerHTML = "";
        this.players.forEach((player, index) => {
            const card = document.createElement("div");
            card.className = "player-input-card";
            card.style.animationDelay = `${index * 100}ms`;
            card.classList.add("animate-slide-up");

            const currentTotal = this.calculateTotalScore(player);
            const isNear100 = currentTotal >= 80 && currentTotal < 100;
            const isOver100 = currentTotal >= 100;

            let totalClass = "";
            let totalIndicator = "";
            if (isOver100) {
                totalClass = "over-100";
                totalIndicator = " — Eliminated";
            } else if (isNear100) {
                totalClass = "near-100";
                totalIndicator = " — Close to 100!";
            } else if (currentTotal === 50 && player.scores.includes(50)) {
                totalClass = "exact-100";
                totalIndicator = " — Reset from 100";
            }

            card.innerHTML = `
                <h4 style="display: flex; align-items: center; gap: var(--space-2);">
                    <span style="color: ${player.color}">●</span>
                    ${player.name}
                </h4>
                <div class="input-row">
                    <div class="input-group">
                        <label>Hand Score</label>
                        <input type="number" id="score-${player.id}" class="input" min="0" max="52" placeholder="0-52">
                    </div>
                </div>
                <div class="checkbox-wrapper" style="margin-top: var(--space-3);">
                    <input type="checkbox" id="cabo-${player.id}">
                    <label for="cabo-${player.id}">Called Cabo this round</label>
                </div>
                <div class="checkbox-wrapper" style="margin-top: var(--space-2);">
                    <input type="checkbox" id="kamikaze-${player.id}">
                    <label for="kamikaze-${player.id}">Kamikaze (two 12s + both 13s)</label>
                </div>
                <div class="total-score-display ${totalClass}">
                    Current Total: <strong id="display-total-${player.id}">${currentTotal}</strong>${totalIndicator}
                </div>
            `;
            this.playerInputs.appendChild(card);
        });
    }

    calculateTotalScore(player) {
        return player.scores.reduce((sum, score) => sum + score, 0);
    }

    finishRound() {
        if (this.gameEnded) {
            this.showToast("The game has ended! Start a new game to play again.");
            return;
        }

        const roundData = {
            round: this.currentRound,
            scores: [],
            winnerId: -1
        };

        let caboCallerId = -1;
        let kamikazePlayerId = -1;

        for (const player of this.players) {
            const handScoreInput = document.getElementById(`score-${player.id}`);
            const caboCheckbox = document.getElementById(`cabo-${player.id}`);
            const kamikazeCheckbox = document.getElementById(`kamikaze-${player.id}`);

            const handScore = parseInt(handScoreInput.value) || 0;
            const calledCabo = caboCheckbox.checked;
            const kamikaze = kamikazeCheckbox.checked;

            if (calledCabo) {
                if (caboCallerId !== -1) {
                    this.showToast("Only one player can call Cabo per round!");
                    return;
                }
                caboCallerId = player.id;
            }

            if (kamikaze) {
                kamikazePlayerId = player.id;
            }

            roundData.scores.push({
                playerId: player.id,
                handScore,
                calledCabo,
                kamikaze,
                finalScore: 0
            });
        }

        const hasAnyScore = roundData.scores.some((s) => s.handScore > 0 || s.kamikaze);
        if (!hasAnyScore) {
            this.showToast("Please enter at least one score!");
            return;
        }

        // Calculate round scores based on Cabo rules:
        // 1. Cabo caller with lowest points → 0 points
        // 2. Cabo caller but NOT lowest → hand score + 10 penalty
        // 3. Non-Cabo caller with lowest → exact hand score (no bonus)
        // 4. Everyone else → exact hand score
        if (kamikazePlayerId !== -1) {
            for (const score of roundData.scores) {
                if (score.playerId === kamikazePlayerId) {
                    score.finalScore = 0;
                } else {
                    score.finalScore = 50;
                }
            }
        } else {
            const validScores = roundData.scores.filter((s) => !s.kamikaze);
            const minHandScore = Math.min(...validScores.map((s) => s.handScore));
            const lowestScorers = roundData.scores.filter((s) => s.handScore === minHandScore && !s.kamikaze);

            // Determine winner and calculate final scores
            let caboCallerWon = false;
            let winnerId = -1;

            // Check if Cabo caller has the lowest score
            if (caboCallerId !== -1) {
                const caboCallerScore = roundData.scores.find((s) => s.playerId === caboCallerId);
                if (caboCallerScore && caboCallerScore.handScore === minHandScore) {
                    caboCallerWon = true;
                    winnerId = caboCallerId;
                }
            }

            // If Cabo caller didn't win, determine winner among lowest scorers
            if (!caboCallerWon && lowestScorers.length > 0) {
                // In case of tie among non-Cabo callers, first one wins (or could be random)
                winnerId = lowestScorers[0].playerId;
            }

            roundData.winnerId = winnerId;

            for (const score of roundData.scores) {
                if (score.calledCabo && caboCallerWon) {
                    // Rule 1: Cabo caller with lowest points → 0 points
                    score.finalScore = 0;
                } else if (score.calledCabo && !caboCallerWon) {
                    // Rule 2: Cabo caller but NOT lowest → hand score + 10
                    score.finalScore = score.handScore + 10;
                    score.caboPenalty = true;
                } else {
                    // Rule 3 & 4: Non-Cabo caller gets exact hand score
                    score.finalScore = score.handScore;
                }
            }
        }

        // Update player scores
        let someoneExceeded100 = false;
        for (const scoreData of roundData.scores) {
            const player = this.players.find((p) => p.id === scoreData.playerId);
            let newTotal = this.calculateTotalScore(player) + scoreData.finalScore;

            // Exactly 100 rule
            if (newTotal === 100) {
                newTotal = 50;
                scoreData.finalScore = 50 - this.calculateTotalScore(player);
                scoreData.exact100Reset = true;
            }

            player.scores.push(scoreData.finalScore);
            player.totalScore = this.calculateTotalScore(player);

            if (player.totalScore > 100) {
                someoneExceeded100 = true;
            }
        }

        this.roundHistory.push(roundData);
        this.updateLeaderboard();
        this.addHistoryEntry(roundData);
        this.drawGraph();

        if (someoneExceeded100) {
            this.endGame();
        } else {
            this.currentRound++;
            this.currentRoundSpan.textContent = this.currentRound.toString();
            this.inputRoundNumber.textContent = this.currentRound.toString();
            this.renderPlayerInputs();
        }

        this.saveGame();
    }

    updateLeaderboard() {
        const sorted = [...this.players].sort((a, b) => a.totalScore - b.totalScore);
        this.leaderboardList.innerHTML = sorted.map((player, index) => `
            <div class="leaderboard-item" style="animation-delay: ${index * 50}ms;">
                <span class="leaderboard-rank">${index + 1}</span>
                <span class="leaderboard-name">
                    <span style="color: ${player.color}; margin-right: var(--space-2);">●</span>
                    ${player.name}
                </span>
                <span class="leaderboard-score" style="color: ${index === 0 ? 'var(--neon-yellow)' : 'inherit'};">${player.totalScore}</span>
            </div>
        `).join("");
    }

    addHistoryEntry(roundData) {
        const entry = document.createElement("div");
        entry.className = "history-item animate-slide-up";

        let detailsHTML = "";
        for (const score of roundData.scores) {
            const player = this.players.find((p) => p.id === score.playerId);
            const isWinner = score.finalScore === 0 && !score.kamikaze;
            const badges = [];

            if (score.kamikaze) {
                badges.push('<span class="badge badge-kamikaze">Kamikaze</span>');
            } else if (isWinner) {
                badges.push('<span class="badge badge-bonus">Winner</span>');
            } else if (score.caboPenalty) {
                badges.push('<span class="badge badge-penalty">Cabo +10</span>');
            }

            if (score.exact100Reset) {
                badges.push('<span class="badge badge-bonus">100→50</span>');
            }

            detailsHTML += `
                <div style="margin: var(--space-2) 0; padding: var(--space-2) var(--space-3); background: var(--bg-secondary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2);">
                    <span>
                        <strong style="color: ${player.color}">${player.name}</strong>: 
                        ${score.handScore} → ${score.finalScore >= 0 ? "+" : ""}${score.finalScore}
                    </span>
                    <span style="display: flex; gap: var(--space-1);">${badges.join("")}</span>
                </div>
            `;
        }

        entry.innerHTML = `
            <div style="width: 100%;">
                <div class="history-round" style="margin-bottom: var(--space-2);">Round ${roundData.round}</div>
                ${detailsHTML}
            </div>
        `;

        this.historyList.insertBefore(entry, this.historyList.firstChild);
    }

    drawGraph() {
        const canvas = document.getElementById("scoreGraph");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const padding = 50;
        const width = rect.width - 2 * padding;
        const height = rect.height - 2 * padding;

        // Clear canvas with cream background
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Empty state
        if (this.players.length === 0 || this.currentRound === 1) {
            ctx.fillStyle = "#6b6b6b"; // Gray 50
            ctx.font = "14px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Score progress will appear after round 1", rect.width / 2, rect.height / 2);
            return;
        }

        // Calculate scales
        const cumulativeScores = this.players.map(p => {
            let sum = 0;
            return p.scores.map(s => { sum += s; return sum; });
        });

        const maxScore = Math.max(...cumulativeScores.flat(), 100);
        const xScale = width / Math.max(this.currentRound - 1, 1);
        const yScale = height / Math.max(maxScore, 50);

        // Draw grid
        ctx.strokeStyle = "#E8E4D9"; // Cream dark
        ctx.lineWidth = 1;

        // Horizontal grid lines
        const yStep = maxScore > 100 ? 50 : 25;
        for (let score = 0; score <= maxScore + yStep; score += yStep) {
            const y = rect.height - padding - score * yScale;
            if (y >= padding) {
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(rect.width - padding, y);
                ctx.stroke();

                ctx.fillStyle = "#6b6b6b"; // Gray 50
                ctx.font = "11px JetBrains Mono, monospace";
                ctx.textAlign = "right";
                ctx.fillText(score.toString(), padding - 8, y + 4);
            }
        }

        // 100 threshold line - Red coral for high visibility
        const y100 = rect.height - padding - 100 * yScale;
        if (y100 > padding) {
            ctx.strokeStyle = "#FF4D4D"; // Red coral
            ctx.setLineDash([6, 4]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(padding, y100);
            ctx.lineTo(rect.width - padding, y100);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = "#FF4D4D"; // Red coral
            ctx.font = "bold 10px Inter, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("100 (Game End)", padding + 5, y100 - 5);
        }

        // Draw player lines
        this.players.forEach((player, playerIndex) => {
            const scores = cumulativeScores[playerIndex];
            if (scores.length === 0) return;

            // Draw line
            ctx.strokeStyle = player.color;
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();

            scores.forEach((score, i) => {
                const x = padding + i * xScale;
                const y = rect.height - padding - score * yScale;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();

            // Draw points
            scores.forEach((score, i) => {
                const x = padding + i * xScale;
                const y = rect.height - padding - score * yScale;

                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = player.color;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // X-axis labels
        ctx.fillStyle = "#404040"; // Gray 70
        ctx.font = "11px Inter, sans-serif";
        ctx.textAlign = "center";
        for (let i = 0; i < this.currentRound; i++) {
            const x = padding + i * xScale;
            ctx.fillText((i + 1).toString(), x, rect.height - padding + 18);
        }

        // Legend
        let legendX = padding;
        const legendY = 25;
        this.players.forEach((player) => {
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(legendX + 6, legendY, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#1a1a1a"; // Gray 90
            ctx.font = "12px Inter, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(player.name, legendX + 16, legendY + 4);

            legendX += ctx.measureText(player.name).width + 35;
        });
    }

    endGame() {
        this.gameEnded = true;
        this.gameEndedBanner.style.display = "block";
        this.nextRoundBtn.textContent = "Game Ended";
        this.nextRoundBtn.disabled = true;
        this.nextRoundBtn.style.opacity = "0.5";
        this.nextRoundBtn.style.cursor = "not-allowed";

        const sorted = [...this.players].sort((a, b) => a.totalScore - b.totalScore);
        const winner = sorted[0];

        this.winnerName.textContent = winner.name;
        this.winnerScore.textContent = `${winner.totalScore} points`;

        this.winnerRankings.innerHTML = sorted.map((player, index) => `
            <div class="winner-rank-item ${index === 0 ? "winner" : ""}" style="animation-delay: ${index * 100}ms;">
                <span class="winner-rank-position">${index + 1}</span>
                <span class="winner-rank-player">
                    <span style="color: ${player.color}; margin-right: var(--space-2);">●</span>
                    ${player.name}
                </span>
                <span class="winner-rank-score">${player.totalScore} pts</span>
            </div>
        `).join("");

        this.winnerModal.classList.add("active");
        this.triggerConfetti();
    }

    triggerConfetti() {
        const canvas = document.getElementById("confettiCanvas");
        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;

        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);

        // Confetti colors - Brutalist palette
        const colors = [...playerColors, "#F0F040", "#0A0A0A", "#FF4D4D", "#50C878"];
        const particles = [];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight - window.innerHeight,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }

        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            let active = false;

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.15;
                p.rotation += p.rotationSpeed;

                if (p.y < window.innerHeight) {
                    active = true;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    ctx.restore();
                }
            });

            if (active) {
                animationId = requestAnimationFrame(animate);
            }
        };

        animate();

        setTimeout(() => {
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }, 5000);
    }

    resetGame() {
        this.players = [];
        this.currentRound = 1;
        this.roundHistory = [];
        this.nextPlayerId = 1;
        this.gameEnded = false;

        this.setupSection.style.display = "block";
        this.gameSection.style.display = "none";
        this.winnerModal.classList.remove("active");
        this.gameEndedBanner.style.display = "none";

        this.nextRoundBtn.textContent = "Finish Round";
        this.nextRoundBtn.disabled = false;
        this.nextRoundBtn.style.opacity = "";
        this.nextRoundBtn.style.cursor = "";

        this.playerNameInput.value = "";
        this.playerList.innerHTML = "";
        this.startGameBtn.style.display = "none";
        this.leaderboardList.innerHTML = "";
        this.playerInputs.innerHTML = "";
        this.historyList.innerHTML = "";
        this.currentRoundSpan.textContent = "1";
        this.inputRoundNumber.textContent = "1";

        const canvas = document.getElementById("scoreGraph");
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        localStorage.removeItem("caboGame");
        this.playerNameInput.focus();
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement("div");
        toast.style.cssText = `
            position: fixed;
            bottom: var(--space-6);
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--surface-90);
            color: var(--white);
            padding: var(--space-4) var(--space-6);
            border-radius: var(--radius-full);
            font-size: var(--text-sm);
            font-weight: var(--font-medium);
            box-shadow: var(--shadow-lg);
            z-index: 2000;
            transition: transform 0.3s var(--ease-out-expo);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = "translateX(-50%) translateY(0)";
        });

        setTimeout(() => {
            toast.style.transform = "translateX(-50%) translateY(100px)";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    saveGame() {
        const gameData = {
            players: this.players,
            currentRound: this.currentRound,
            roundHistory: this.roundHistory,
            nextPlayerId: this.nextPlayerId,
            gameStarted: this.gameSection.style.display !== "none"
        };
        localStorage.setItem("caboGame", JSON.stringify(gameData));
    }

    loadGame() {
        const saved = localStorage.getItem("caboGame");
        if (!saved) return;

        try {
            const gameData = JSON.parse(saved);
            this.players = gameData.players || [];
            this.currentRound = gameData.currentRound || 1;
            this.roundHistory = gameData.roundHistory || [];
            this.nextPlayerId = gameData.nextPlayerId || 1;

            this.renderPlayerList();

            if (gameData.gameStarted && this.players.length > 0) {
                this.setupSection.style.display = "none";
                this.gameSection.style.display = "block";
                this.currentRoundSpan.textContent = this.currentRound.toString();
                this.inputRoundNumber.textContent = this.currentRound.toString();
                this.renderPlayerInputs();
                this.updateLeaderboard();

                this.historyList.innerHTML = "";
                this.roundHistory.forEach((round) => this.addHistoryEntry(round));

                setTimeout(() => this.drawGraph(), 100);

                const maxScore = Math.max(...this.players.map((p) => p.totalScore));
                if (maxScore > 100) {
                    this.endGame();
                }
            }
        } catch (e) {
            console.error("Failed to load saved game:", e);
        }
    }
}

// Initialize game
const game = new CaboGame();

// Handle window resize for graph
let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (game && typeof game.drawGraph === "function") {
            game.drawGraph();
        }
    }, 100);
});

// Handle visibility change (redraw graph when tab becomes visible)
document.addEventListener("visibilitychange", () => {
    if (!document.hidden && game && game.gameSection.style.display !== "none") {
        game.drawGraph();
    }
});
