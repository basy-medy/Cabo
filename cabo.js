// cabo.ts
// Industrial/EA Theme - Muted, functional colors for player identification
var playerColors = [
  "#1a5f7a", // Muted teal (primary accent)
  "#5d6d7e", // Steel blue-gray
  "#4a6741", // Muted green
  "#7d5a5a", // Muted brick
  "#6b5b73"  // Muted purple-gray
];

class CaboGame {
  players = [];
  currentRound = 1;
  roundHistory = [];
  nextPlayerId = 1;
  gameEnded = false;
  playerNameInput;
  addPlayerBtn;
  playerList;
  startGameBtn;
  setupSection;
  gameSection;
  currentRoundSpan;
  inputRoundNumber;
  nextRoundBtn;
  resetGameBtn;
  leaderboardList;
  playerInputs;
  historyList;
  winnerModal;
  winnerName;
  winnerScore;
  winnerRankings;
  closeWinnerModalBtn;
  gameEndedBanner;
  constructor() {
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
      if (e.key === "Enter")
        this.addPlayer();
    });
    this.startGameBtn.addEventListener("click", () => this.startGame());
    this.nextRoundBtn.addEventListener("click", () => this.finishRound());
    this.resetGameBtn.addEventListener("click", () => this.resetGame());
    this.closeWinnerModalBtn.addEventListener("click", () => this.resetGame());
  }
  addPlayer() {
    const name = this.playerNameInput.value.trim();
    if (!name)
      return;
    if (this.players.length >= 5) {
      alert("Maximum 5 players allowed in Cabo!");
      return;
    }
    if (this.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      alert("Player name already exists!");
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
    this.players.forEach((player) => {
      const tag = document.createElement("div");
      tag.className = "player-tag";
      tag.style.backgroundColor = player.color;
      tag.innerHTML = `
                <span>${player.name}</span>
                <button onclick="game.removePlayer(${player.id})">×</button>
            `;
      this.playerList.appendChild(tag);
    });
    this.startGameBtn.style.display = this.players.length >= 2 ? "inline-block" : "none";
  }
  startGame() {
    if (this.players.length < 2)
      return;
    this.setupSection.style.display = "none";
    this.gameSection.style.display = "block";
    this.renderPlayerInputs();
    this.saveGame();
  }
  renderPlayerInputs() {
    this.playerInputs.innerHTML = "";
    this.players.forEach((player) => {
      const card = document.createElement("div");
      card.className = "player-input-card";
      card.style.borderLeftColor = player.color;
      const currentTotal = this.calculateTotalScore(player);
      card.innerHTML = `
                <h4>${player.name}</h4>
                <div class="input-row">
                    <div class="input-group">
                        <label>Hand Score (0-52)</label>
                        <input type="number" id="score-${player.id}" min="0" max="52" placeholder="Points">
                    </div>
                </div>
                <div class="cabo-checkbox">
                    <input type="checkbox" id="cabo-${player.id}">
                    <label for="cabo-${player.id}">Called Cabo this round</label>
                </div>
                <div class="cabo-checkbox">
                    <input type="checkbox" id="kamikaze-${player.id}">
                    <label for="kamikaze-${player.id}">\uD83C\uDFAF Kamikaze (two 12s + both 13s)</label>
                </div>
                <div class="total-score-display">
                    Current Total: <span id="display-total-${player.id}">${currentTotal}</span> points
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
      alert("The game has ended! Start a new game to play again.");
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
          alert("Only one player can call Cabo per round!");
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
      alert("Please enter at least one score!");
      return;
    }
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
      const winners = roundData.scores.filter((s) => s.handScore === minHandScore && !s.kamikaze);
      let actualWinnerId;
      if (winners.length === 1) {
        actualWinnerId = winners[0].playerId;
      } else {
        const caboCallerInTie = winners.find((w) => w.playerId === caboCallerId);
        if (caboCallerInTie) {
          actualWinnerId = caboCallerId;
        } else {
          actualWinnerId = -1;
        }
      }
      roundData.winnerId = actualWinnerId;
      for (const score of roundData.scores) {
        // Everyone gets their hand score by default
        score.finalScore = score.handScore;

        // Cabo caller who got it wrong gets +10 penalty
        if (score.calledCabo && score.playerId !== actualWinnerId) {
          score.finalScore += 10;
        }
      }
    }
    let someoneExceeded100 = false;
    for (const scoreData of roundData.scores) {
      const player = this.players.find((p) => p.id === scoreData.playerId);
      let newTotal = this.calculateTotalScore(player) + scoreData.finalScore;
      if (newTotal === 100) {
        newTotal = 50;
        scoreData.finalScore = 50 - this.calculateTotalScore(player);
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
            <div class="leaderboard-item">
                <span class="leaderboard-rank">${index + 1}</span>
                <span class="leaderboard-name">${player.name}</span>
                <span class="leaderboard-score" style="color: ${player.color}">${player.totalScore}</span>
            </div>
        `).join("");
  }
  addHistoryEntry(roundData) {
    const entry = document.createElement("div");
    entry.className = "history-item";
    let detailsHTML = "";
    for (const score of roundData.scores) {
      const player = this.players.find((p) => p.id === score.playerId);
      const isWinner = score.finalScore === 0;
      const badges = [];
      if (score.kamikaze)
        badges.push('<span class="kamikaze-badge">KAMIKAZE</span>');
      else if (isWinner)
        badges.push('<span class="bonus-badge">WINNER</span>');
      else if (score.calledCabo)
        badges.push('<span class="penalty-badge">CABO +10</span>');
      detailsHTML += `
                <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1);">
                    <strong style="color: ${player.color}">${player.name}</strong>: 
                    Hand ${score.handScore} → Round ${score.finalScore >= 0 ? "+" : ""}${score.finalScore}
                    ${badges.join("")}
                </div>
            `;
    }
    entry.innerHTML = `
            <div>
                <div class="history-round">Round ${roundData.round}</div>
                ${detailsHTML}
            </div>
        `;
    this.historyList.insertBefore(entry, this.historyList.firstChild);
  }
  drawGraph() {
    const canvas = document.getElementById("scoreGraph");
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (this.players.length === 0 || this.currentRound === 1) {
      ctx.fillStyle = "#8d8d8d";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Score progress will appear here", canvas.width / 2, canvas.height / 2);
      return;
    }
    const maxScore = Math.max(...this.players.map((p) => Math.max(...p.scores.reduce((acc, s, i) => {
      acc.push((acc[i] || 0) + s);
      return acc;
    }, []), 0))) || 100;
    const xScale = width / Math.max(this.currentRound - 1, 1);
    const yScale = height / Math.max(maxScore, 50);
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    const y100 = canvas.height - padding - 100 * yScale;
    if (y100 > padding) {
      ctx.strokeStyle = "#da1e28";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, y100);
      ctx.lineTo(canvas.width - padding, y100);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#da1e28";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("100 (Game End)", padding + 5, y100 - 3);
    }
    this.players.forEach((player) => {
      ctx.strokeStyle = player.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      let cumulativeScore = 0;
      for (let i = 0;i < player.scores.length; i++) {
        cumulativeScore += player.scores[i];
        const x = padding + i * xScale;
        const y = canvas.height - padding - cumulativeScore * yScale;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      cumulativeScore = 0;
      for (let i = 0;i < player.scores.length; i++) {
        cumulativeScore += player.scores[i];
        const x = padding + i * xScale;
        const y = canvas.height - padding - cumulativeScore * yScale;
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.fillStyle = "#525252";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    for (let i = 0;i < this.currentRound; i++) {
      const x = padding + i * xScale;
      ctx.fillText((i + 1).toString(), x, canvas.height - padding + 15);
    }
    ctx.textAlign = "right";
    const yStep = maxScore > 100 ? 50 : 25;
    for (let score = 0;score <= maxScore + yStep; score += yStep) {
      const y = canvas.height - padding - score * yScale;
      if (y >= padding) {
        ctx.fillText(score.toString(), padding - 5, y + 4);
      }
    }
    let legendX = padding;
    const legendY = 20;
    this.players.forEach((player) => {
      ctx.fillStyle = player.color;
      ctx.fillRect(legendX, legendY - 8, 12, 12);
      ctx.fillStyle = "#161616";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(player.name, legendX + 16, legendY + 2);
      legendX += ctx.measureText(player.name).width + 35;
    });
  }
  endGame() {
    this.gameEnded = true;
    this.gameEndedBanner.style.display = "block";
    this.nextRoundBtn.textContent = "Game Ended";
    this.nextRoundBtn.disabled = true;
    const sorted = [...this.players].sort((a, b) => a.totalScore - b.totalScore);
    const winner = sorted[0];
    this.winnerName.textContent = winner.name;
    this.winnerScore.textContent = `${winner.totalScore} points`;
    this.winnerRankings.innerHTML = sorted.map((player, index) => `
            <div class="winner-rank-item ${index === 0 ? "winner" : ""}">
                <span class="winner-rank-position">${index + 1}</span>
                <span class="winner-rank-player">${player.name}</span>
                <span class="winner-rank-score">${player.totalScore} pts</span>
            </div>
        `).join("");
    this.winnerModal.style.display = "flex";
    this.triggerConfetti();
  }
  triggerConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    // Industrial/EA Theme - Confetti colors
const colors = ["#1a5f7a", "#5d6d7e", "#4a6741", "#7d5a5a", "#6b5b73"];
    for (let i = 0;i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4
      });
    }
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        if (p.y < canvas.height) {
          active = true;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      });
      if (active) {
        animationId = requestAnimationFrame(animate);
      }
    };
    animate();
    setTimeout(() => {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    this.winnerModal.style.display = "none";
    this.gameEndedBanner.style.display = "none";
    this.nextRoundBtn.textContent = "Finish Round";
    this.nextRoundBtn.disabled = false;
    this.playerNameInput.value = "";
    this.playerList.innerHTML = "";
    this.startGameBtn.style.display = "none";
    this.leaderboardList.innerHTML = "";
    this.playerInputs.innerHTML = "";
    this.historyList.innerHTML = "";
    this.currentRoundSpan.textContent = "1";
    this.inputRoundNumber.textContent = "1";
    const canvas = document.getElementById("scoreGraph");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem("caboGame");
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
    if (!saved)
      return;
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
var game = new CaboGame;
window.addEventListener("resize", () => {
  if (game) {
    game["drawGraph"]();
  }
});
