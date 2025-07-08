class initializeGame {
    constructor() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.gameMode = 'classic';
        this.difficulty = 'easy';
        this.currentRound = 1;
        this.maxRounds = 1;
        this.soundEnabled = true;
        this.gameActive = true;
        this.gameHistory = [];
        this.achievements = [];
        this.computerPersonality = 'Standard AI';

        // Statistics
        this.stats = {
            totalGames: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            currentStreak: 0,
            bestStreak: 0,
            rockCount: 0,
            paperCount: 0,
            scissorsCount: 0
        };

        this.choices = ['rock', 'paper', 'scissors'];
        this.emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };

        this.initializeGame();
        this.loadStats();
        this.createParticles();
    }

    initializeGame() {
        this.bindEvents();
        this.updateDisplay();
        this.updateStatsDisplay();
    }

    // Bind the event handlers
    bindEvents() {
        // Game mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setGameMode(e.target.dataset.mode);
            });
        });

        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setDifficulty(e.target.dataset.difficulty);
            });
        });

        // Choice selection
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.gameActive) { this.makeChoice(e.target.dataset.choice) }
            });
        });

        // Control buttons
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('resetStatsBtn').addEventListener('click', () => {
            this.showConfirm();
        });

        document.getElementById('showStatsBtn').addEventListener('click', () => {
            this.toggleStats();
        });

        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
    }

    setGameMode(mode) {
        this.gameMode = mode;

        // Update active button
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

        // Set max rounds based on mode
        switch (mode) {
            case 'best-of-3':
                this.maxRounds = 3;
                break;
            case 'best-of-5':
                this.maxRounds = 5;
                break;
            case 'tournament':
                this.maxRounds = 1;
                this.setupTournament();
                break;
            default:
                this.maxRounds = 1;
        }

        this.newGame();
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;

        // Update active button
        document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');

        // Update computer personality
        switch (difficulty) {
            case 'easy':
                this.computerPersonality = 'Friendly AI';
                break;
            case 'medium':
                this.computerPersonality = 'Smart AI';
                break;
            case 'hard':
                this.computerPersonality = 'Master AI';
                break;
        }

        document.getElementById('computerName').textContent = this.computerPersonality;
    }

    makeChoice(playerChoice) {
        if (!this.gameActive) return;

        this.gameActive = false;
        this.disableChoices();

        // Record player choice
        this.stats[`${playerChoice}Count`]++;

        // Show player choice with animation
        const playerChoiceEl = document.getElementById('playerChoice');
        playerChoiceEl.textContent = this.emojis[playerChoice];
        playerChoiceEl.classList.add('choice-reveal');

        // Computer makes choice after delay
        setTimeout(() => {
            const computerChoice = this.getComputerChoice(playerChoice);
            const computerChoiceEl = document.getElementById('computerChoice');
            computerChoiceEl.textContent = this.emojis[computerChoice];
            computerChoiceEl.classList.add('choice-reveal');

            // Determine winner after another delay
            setTimeout(() => {
                this.determineWinner(playerChoice, computerChoice);
            }, 600);
        }, 1000);

        this.playSound('choice');
    }

    getComputerChoice(playerChoice) {
        let choice;

        switch (this.difficulty) {
            case 'easy':
                // Random choice
                choice = this.choices[Math.floor(Math.random() * 3)];
                break;

            case 'medium':
                // 60% chance to counter player's most used choice
                if (Math.random() < 0.6 && this.gameHistory.length > 2) {
                    const mostUsed = this.getMostUsedChoice();
                    choice = this.getCounterChoice(mostUsed);
                } else {
                    choice = this.choices[Math.floor(Math.random() * 3)];
                }
                break;

            case 'hard':
                // 80% chance to use advanced strategy
                if (Math.random() < 0.8 && this.gameHistory.length > 1) {
                    const lastChoice = this.gameHistory[this.gameHistory.length - 1].playerChoice;
                    const pattern = this.detectPattern();
                    choice = pattern ? this.getCounterChoice(pattern) : this.getCounterChoice(lastChoice);
                } else {
                    choice = this.choices[Math.floor(Math.random() * 3)];
                }
                break;

            default:
                // Random choice 
                choice = this.choices[Math.floor(Math.random() * 3)];
        }

        return choice;
    }

    getMostUsedChoice() {
        const counts = {
            rock: this.stats.rockCount,
            paper: this.stats.paperCount,
            scissors: this.stats.scissorsCount
        };

        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    detectPattern() {
        if (this.gameHistory.length < 3) return null;

        const recent = this.gameHistory.slice(-3).map(game => game.playerChoice);
        const patterns = {
            'rock,paper,scissors': 'rock',
            'paper,scissors,rock': 'paper',
            'scissors,rock,paper': 'scissors'
        };

        return patterns[recent.join(',')] || null;
    }

    getCounterChoice(choice) {
        const counters = {
            rock: 'paper',
            paper: 'scissors',
            scissors: 'rock'
        };
        return counters[choice];
    }

    determineWinner(playerChoice, computerChoice) {
        let result;

        if (playerChoice === computerChoice) {
            result = 'draw';
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            result = 'win';
            this.playerScore++;
        } else {
            result = 'lose';
            this.computerScore++;
        }

        // Record game in history
        this.gameHistory.push({
            playerChoice,
            computerChoice,
            result,
            timestamp: new Date()
        });

        this.showResult(result);
        this.updateStats(result);
        this.updateDisplay();
        this.checkAchievements();

        // Check if game/series is complete
        setTimeout(() => {
            if (this.isGameComplete()) this.endGame();
            else this.nextRound();
        }, 2000);
    }

    showResult(result) {
        const resultEl = document.getElementById('resultMessage');
        const playerChoiceEl = document.getElementById('playerChoice');
        const computerChoiceEl = document.getElementById('computerChoice');

        resultEl.classList.remove('show', 'win', 'lose', 'draw');

        // Setting message
        let message;
        switch (result) {
            case 'win':
                message = '🎉 You Win!';
                resultEl.classList.add('win');
                playerChoiceEl.classList.add('winner');
                computerChoiceEl.classList.add('loser');
                this.playSound('win');
                break;
            case 'lose':
                message = '💔 You Lose!';
                resultEl.classList.add('lose');
                playerChoiceEl.classList.add('loser');
                computerChoiceEl.classList.add('winner');
                this.playSound('lose');
                break;
            case 'draw':
                message = '🤝 It\'s a Draw!';
                resultEl.classList.add('draw');
                this.playSound('draw');
                break;
        }

        // Showing result
        resultEl.textContent = message;
        resultEl.classList.add('show', 'result-pop');

        // Remove animation classes after animation completes
        setTimeout(() => {
            playerChoiceEl.classList.remove('choice-reveal', 'winner', 'loser');
            computerChoiceEl.classList.remove('choice-reveal', 'winner', 'loser');
            resultEl.classList.remove('result-pop');
        }, 1000);
    }

    updateStats(result) {
        this.stats.totalGames++;

        switch (result) {
            case 'win':
                this.stats.wins++;
                this.stats.currentStreak++;
                if (this.stats.currentStreak > this.stats.bestStreak) {
                    this.stats.bestStreak = this.stats.currentStreak;
                }
                break;
            case 'lose':
                this.stats.losses++;
                this.stats.currentStreak = 0;
                break;
            case 'draw':
                this.stats.draws++;
                break;
        }

        this.saveStats();
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        const winRate = this.stats.totalGames > 0 ? Math.round((this.stats.wins / this.stats.totalGames) * 100) : 0;

        document.getElementById('totalGamesPlayed').textContent = this.stats.totalGames;
        document.getElementById('winRate').textContent = `${winRate}%`;
        document.getElementById('currentStreak').textContent = this.stats.currentStreak;
        document.getElementById('bestStreak').textContent = this.stats.bestStreak;
    }

    isGameComplete() {
        if (this.gameMode === 'classic') return true;
        const targetWins = Math.ceil(this.maxRounds / 2);
        return this.playerScore >= targetWins || this.computerScore >= targetWins;
    }

    nextRound() {
        this.currentRound++;
        this.gameActive = true;
        this.enableChoices();

        // Reset choice displays
        document.getElementById('playerChoice').textContent = '❓';
        document.getElementById('computerChoice').textContent = '❓';
        document.getElementById('resultMessage').textContent = 'Make your choice!';
        document.getElementById('resultMessage').classList.remove('show', 'win', 'lose', 'draw');
    }

    endGame() {
        let finalMessage;

        // Setting final message
        if (this.gameMode !== 'classic') {
            if (this.playerScore > this.computerScore) {
                finalMessage = `🏆 Series Complete! You won ${this.playerScore}-${this.computerScore}!`;
                this.playSound('victory');
            } else if (this.computerScore > this.playerScore) {
                finalMessage = `😢 Series Complete! Computer won ${this.computerScore}-${this.playerScore}!`;
                this.playSound('defeat');
            } else {
                finalMessage = `🤝 Series Complete! It's a tie ${this.playerScore}-${this.computerScore}!`;
                this.playSound('draw');
            }

            // Showing final result
            document.getElementById('resultMessage').textContent = finalMessage;
            document.getElementById('resultMessage').classList.add('show', 'result-pop');
        }

        this.gameActive = false;
        this.disableChoices();

        // Auto-start new game after delay
        setTimeout(() => this.newGame(), 4000);
    }

    newGame() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.currentRound = 1;
        this.gameActive = true;

        this.updateDisplay();
        this.enableChoices();

        // Reset displays
        document.getElementById('playerChoice').textContent = '❓';
        document.getElementById('computerChoice').textContent = '❓';
        document.getElementById('resultMessage').textContent = 'Make your choice!';
        document.getElementById('resultMessage').classList.remove('show', 'win', 'lose', 'draw');
    }

    updateDisplay() {
        document.getElementById('playerScore').textContent = this.playerScore;
        document.getElementById('computerScore').textContent = this.computerScore;
    }

    enableChoices() {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.classList.remove('disabled');
        });
    }

    disableChoices() {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.classList.add('disabled');
        });
    }

    setupTournament() {
        document.getElementById('tournamentBracket').classList.add('active');
        // Tournament logic would go here
    }

    checkAchievements() {
        const achievements = [];

        // First win
        if (this.stats.wins === 1) {
            achievements.push({
                title: 'First Victory!',
                description: 'You won your first game!'
            });
        }

        // Win streak achievements
        if (this.stats.currentStreak === 5) {
            achievements.push({
                title: 'On Fire!',
                description: 'Won 5 games in a row!'
            });
        }

        if (this.stats.currentStreak === 10) {
            achievements.push({
                title: 'Unstoppable!',
                description: 'Won 10 games in a row!'
            });
        }

        // Game count achievements
        if (this.stats.totalGames === 10) {
            achievements.push({
                title: 'Getting Started',
                description: 'Played 10 games!'
            });
        }

        if (this.stats.totalGames === 50) {
            achievements.push({
                title: 'Regular Player',
                description: 'Played 50 games!'
            });
        }

        if (this.stats.totalGames === 100) {
            achievements.push({
                title: 'Dedicated Player',
                description: 'Played 100 games!'
            });
        }

        // Show new achievements
        achievements.forEach(achievement => {
            if (!this.achievements.includes(achievement.title)) {
                this.achievements.push(achievement.title);
                this.showAchievement(achievement);
            }
        });
    }

    showAchievement(achievement) {
        const popup = document.getElementById('achievementPopup');
        const title = document.getElementById('achievementTitle');
        const description = document.getElementById('achievementDescription');

        title.textContent = achievement.title;
        description.textContent = achievement.description;

        popup.classList.add('show');
        this.playSound('achievement');

        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
    }

    toggleStats() {
        const statsPanel = document.getElementById('statsPanel');
        const showBtn = document.getElementById('showStatsBtn');

        if (statsPanel.style.display === 'none' || !statsPanel.style.display) {
            statsPanel.style.display = 'grid';
            showBtn.textContent = 'Hide Stats';
        } else {
            statsPanel.style.display = 'none';
            showBtn.textContent = 'Show Stats';
        }
    }

    showConfirm() {
        const modal = document.getElementById('customConfirm');
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');

        document.getElementById('confirmMessage').textContent = "Are you sure you want to reset all statistics?";
        modal.classList.remove('hidden');

        const cleanup = () => {
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
            modal.classList.add('hidden');
        };

        const onYes = () => {
            cleanup();
            this.stats = {
                totalGames: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                currentStreak: 0,
                bestStreak: 0,
                rockCount: 0,
                paperCount: 0,
                scissorsCount: 0
            };

            this.achievements = [];
            this.gameHistory = [];
            this.saveStats();
            this.updateStatsDisplay();
            this.playSound('reset');
        };

        const onNo = () => cleanup();

        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundToggle');

        if (this.soundEnabled) {
            soundBtn.textContent = '🔊';
            soundBtn.classList.remove('muted');
        } else {
            soundBtn.textContent = '🔇';
            soundBtn.classList.add('muted');
        }
    }

    playSound(type) {
        if (!this.soundEnabled) return;

        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Different sounds for different events
        switch (type) {
            case 'choice':
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'win':
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'lose':
                oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(262, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'draw':
                oscillator.frequency.setValueAtTime(392, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.15);
                break;
            case 'victory':
                // Victory fanfare
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.setValueAtTime(523 + (i * 100), audioContext.currentTime);
                        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                        osc.start();
                        osc.stop(audioContext.currentTime + 0.1);
                    }, i * 100);
                }
                break;
            case 'defeat':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.4);
                break;
            case 'achievement':
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'reset':
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
        }
    }

    saveStats() {
        const data = {
            stats: this.stats,
            achievements: this.achievements,
            gameHistory: this.gameHistory.slice(-100)
        };

        // Store in memory instead of localStorage
        window.gameData = data;
    }

    loadStats() {
        const data = window.gameData;
        if (data) {
            this.stats = { ...this.stats, ...data.stats };
            this.achievements = data.achievements || [];
            this.gameHistory = data.gameHistory || [];
        }
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');

        for (let i = 0; i < 60; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particlesContainer.appendChild(particle);
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new initializeGame();
});