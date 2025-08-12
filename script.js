document.addEventListener('DOMContentLoaded', () => {
    const appleContainer = document.getElementById('apple-container');
    const scoreDisplay = document.getElementById('score');
    const timeGauge = document.getElementById('time-gauge');
    const selectionBox = document.getElementById('selection-box');
    const overlay = document.getElementById('overlay');
    const startScreen = document.getElementById('start-screen');
    const endScreen = document.getElementById('end-screen');
    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    const GAME_TIME = 120;
    const TARGET_SUM = 10;
    
    let GRID_COLS, GRID_ROWS, TOTAL_APPLES;
    let score, timeLeft, timerId, isDragging, startX, startY;
    let gameActive = false;

    function init() {
        gameActive = false; isDragging = false; if (timerId) clearInterval(timerId);
        const style = getComputedStyle(document.documentElement);
        GRID_COLS = parseInt(style.getPropertyValue('--grid-cols'));
        GRID_ROWS = parseInt(style.getPropertyValue('--grid-rows'));
        TOTAL_APPLES = GRID_COLS * GRID_ROWS;
        score = 0; timeLeft = GAME_TIME;
        scoreDisplay.textContent = score;
        timeGauge.style.width = '100%';
        overlay.style.display = 'flex';
        startScreen.style.display = 'flex'; endScreen.style.display = 'none';
        Array.from(appleContainer.querySelectorAll('.apple')).forEach(apple => apple.remove());
        startButton.onclick = startGame;
        restartButton.onclick = startGame;
    }

    function startGame() {
        init(); gameActive = true; overlay.style.display = 'none';
        for (let i = 0; i < TOTAL_APPLES; i++) createApple();
        timerId = setInterval(updateTimer, 100);
        appleContainer.addEventListener('mousedown', (e) => startDrag(e));
        document.addEventListener('mousemove', (e) => drag(e));
        document.addEventListener('mouseup', endDrag);
        appleContainer.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(e.touches[0]); }, { passive: false });
        document.addEventListener('touchmove', (e) => { e.preventDefault(); drag(e.touches[0]); }, { passive: false });
        document.addEventListener('touchend', endDrag);
    }

    function createApple() {
        const apple = document.createElement('div');
        apple.classList.add('apple');
        apple.dataset.number = Math.floor(Math.random() * 9) + 1;
        apple.textContent = apple.dataset.number;
        appleContainer.appendChild(apple);
    }
    
    function startDrag(e) {
        if (!gameActive || !e) return;
        isDragging = true;
        const rect = appleContainer.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        selectionBox.style.transform = `translate(${startX}px, ${startY}px)`;
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
        selectionBox.style.display = 'block';
        selectionBox.classList.remove('valid');
    }

    function drag(e) {
        if (!gameActive || !isDragging || !e) return;
        const rect = appleContainer.getBoundingClientRect();
        let currentX = e.clientX - rect.left;
        let currentY = e.clientY - rect.top;
        currentX = Math.max(0, Math.min(currentX, rect.width));
        currentY = Math.max(0, Math.min(currentY, rect.height));
        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        selectionBox.style.transform = `translate(${x}px, ${y}px)`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
        checkSelection();
    }
    
    function endDrag() {
        if (!gameActive || !isDragging) return;
        isDragging = false;
        const selectedApples = getSelectedApples();
        const sum = selectedApples.reduce((total, apple) => total + parseInt(apple.dataset.number), 0);
        selectionBox.style.display = 'none';
        if (sum === TARGET_SUM && selectedApples.length > 0) {
            score += selectedApples.length;
            scoreDisplay.textContent = score;
            selectedApples.forEach(apple => apple.classList.add('removed'));
            if (score === TOTAL_APPLES) gameClear();
        }
    }
    function checkSelection() {
        const selectedApples = getSelectedApples();
        const sum = selectedApples.reduce((total, apple) => total + parseInt(apple.dataset.number), 0);
        selectionBox.classList.toggle('valid', sum === TARGET_SUM && selectedApples.length > 0);
    }
    function getSelectedApples() {
        const boxRect = selectionBox.getBoundingClientRect();
        const apples = Array.from(appleContainer.querySelectorAll('.apple:not(.removed)'));
        return apples.filter(apple => {
            const appleRect = apple.getBoundingClientRect();
            const appleCenterX = appleRect.left + appleRect.width / 2;
            const appleCenterY = appleRect.top + appleRect.height / 2;
            return appleCenterX > boxRect.left && appleCenterX < boxRect.right &&
                   appleCenterY > boxRect.top && appleCenterY < boxRect.bottom;
        });
    }
    function updateTimer() {
        if (!gameActive) return;
        timeLeft -= 0.1;
        const percentageLeft = Math.max(0, (timeLeft / GAME_TIME) * 100);
        timeGauge.style.width = `${percentageLeft}%`;
        if (timeLeft <= 0) gameOver("시간 초과!");
    }
    function gameClear() {
        const timeTaken = GAME_TIME - timeLeft;
        gameOver("ALL CLEAR!", `소요 시간: ${timeTaken.toFixed(1)}초`);
    }
    function gameOver(title, message = `최종 점수: <span id="final-score-value">${score}</span>`) {
        if (!gameActive) return;
        gameActive = false; clearInterval(timerId);
        endTitle.textContent = title;
        endMessage.innerHTML = message;
        overlay.style.display = 'flex';
        startScreen.style.display = 'none';
        endScreen.style.display = 'flex';
    }

    init();
});