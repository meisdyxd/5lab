document.addEventListener('DOMContentLoaded', function() {
    let selectedCell = null;
    let board = Array(9).fill().map(() => Array(9).fill(0));
    let solution = Array(9).fill().map(() => Array(9).fill(0));
    let fixedCells = Array(9).fill().map(() => Array(9).fill(false));
	let currentHP = 5;
	let maxHP = 5;

    const gridElement = document.getElementById('sudoku-grid');
    const messageElement = document.getElementById('message');
    const newGameButton = document.getElementById('new-game');
    const solveButton = document.getElementById('solve');
    const hintButton = document.getElementById('hint');
    const clearButton = document.getElementById('clear');
    const difficultySelect = document.getElementById('difficulty');
    const bodyElement = document.getElementsByTagName('body')[0];
	const healthBar = document.getElementById('healthbar');
    
    initGame();
    
    function initGame() {
        createGrid();
        setupEventListeners();
        generateNewGame();
		renderHP();
    }
    
    function createGrid() {
        gridElement.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const row = document.createElement('tr');
            
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                cell.readOnly = true;
                setConstraintsToInput(input, i, j);
                
                if ((j + 1) % 3 === 0 && j < 8) {
                    input.classList.add('border-right-thick');
                }
                
                if ((i + 1) % 3 === 0 && i < 8) {
                    input.classList.add('border-bottom-thick');
                }
                
                cell.appendChild(input);
                row.appendChild(cell);
            }
            
            gridElement.appendChild(row);
        }
    }
    
    function setupEventListeners() {
        bodyElement.addEventListener('keydown', (e) => {
            if (e.key == 'i'){
				console.log(selectedCell === null ? 'empty' : selectedCell);
				console.log('board', board);
				console.log('solution', solution);
				console.log('fixed cells', fixedCells);
			}			
        });

        gridElement.addEventListener('keydown', handleKeyDown);
        
        gridElement.addEventListener('click', function(e) {
            if (e.target.tagName === 'INPUT') {
                selectCell(e.target);
            }
        });
        
        newGameButton.addEventListener('click', generateNewGame);
        solveButton.addEventListener('click', solvePuzzle);
        hintButton.addEventListener('click', provideHint);
        clearButton.addEventListener('click', clearUserInput);
        
        gridElement.addEventListener('mouseover', function(e) {
            if (e.target.tagName === 'INPUT' && e.target !== selectedCell) {
                e.target.style.backgroundColor = '#f0f0f0';
            }
        });
        
        gridElement.addEventListener('mouseout', function(e) {
            if (e.target.tagName === 'INPUT' && e.target !== selectedCell) {
                if (!fixedCells[e.target.dataset.row][e.target.dataset.col]) {
                    e.target.style.backgroundColor = 'white';
                } else {
                    e.target.style.backgroundColor = '#ecf0f1';
                }
            }
        });
    }
    
    function selectCell(cell, keyMove = false) {
        if (selectedCell) {
            selectedCell.style.backgroundColor = 
                fixedCells[selectedCell.dataset.row][selectedCell.dataset.col]
                ? '#ecf0f1' 
                : 'white';
        }

        selectedCell = cell;
        selectedCell.focus();
        selectedCell.style.backgroundColor = '#d6eaf8';
        
        if (fixedCells[cell.dataset.row][cell.dataset.col]) {
            selectedCell.style.backgroundColor = '#d1f7c4';
        }
    }
    
    function handleKeyDown(e) {
        if (!selectedCell) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        if (fixedCells[row][col] 
            && !(e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                    e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            e.preventDefault();
            return;
        }
        
		clearMessage();
		
        if (e.key >= '1' && e.key <= '9') {
            selectedCell.value = e.key;
            board[row][col] = parseInt(e.key);
            validateCell(row, col);
			checkLoose();
        } 
        else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            selectedCell.value = '';
            board[row][col] = 0;
            selectedCell.classList.remove('error');
        } 
        else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                    e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            navigateGrid(e.key);
        }
        else {
            e.preventDefault();
        }
    }
    
	function checkLoose(){
		if(currentHP == 0)
			showMessage('Вы проиграли. Для продолжения вам нужно начать новую игру', 'error');
		renderHP();
	}
	
	function renderHP(){
		healthBar.innerHTML = '';
		
		for(i = 0; i < currentHP; i++){
			const hp = document.createElement('img');
			hp.classList.add('hp full');
			hp.dataset.seq = i;
			healthBar.appendChild(hp);
		}
		for(i = 0; i < maxHP-currentHP; i++){
			const hp = document.createElement('img');
			hp.classList.add('hp empty');
			hp.dataset.seq = i;
			healthBar.appendChild(hp);
		}
	}
	
    function navigateGrid(direction) {
        if (!selectedCell) return;

        let row = parseInt(selectedCell.dataset.row);
        let col = parseInt(selectedCell.dataset.col);
        
        switch (direction) {
            case 'ArrowUp': row = row > 0 
                ? row - 1 
                : 8; 
                break;
            case 'ArrowDown': row = row < 8 
                ? row + 1 
                : 0; 
                break;
            case 'ArrowLeft': col = col > 0 
                ? col - 1 
                : 8; 
                break;
            case 'ArrowRight': col = col < 8 
                ? col + 1 
                : 0; 
                break;
        }
        
        const newCell = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
        selectCell(newCell, true);
    }
    
    function generateNewGame() {
        clearMessage();
        
        generateSolvedBoard();
        
        const difficulty = difficultySelect.value;
        let cellsToRemove;
        
        switch (difficulty) {
            case 'easy': 
				cellsToRemove = 35; 
				currentHP = 5; 
				maxHP = 5;
				break;
            case 'medium': 
				cellsToRemove = 45; 
				currentHP = 3;
				maxHP = 3;
				break;
            case 'hard': 
				cellsToRemove = 55;
				currentHP = 1;
				maxHP = 1;
				break;
            default: cellsToRemove = 40;
        }
        renderHP();
        createPlayableBoard(cellsToRemove);
        updateGrid();
    }
    
    function generateSolvedBoard() {
        solution = Array(9).fill().map(() => Array(9).fill(0));

        fillDiagonalBoxes();
        
        solveSudoku(solution);
        
        board = solution.map(row => [...row]);
    }
    
    function fillDiagonalBoxes() {
        for (let i = 0; i < 9; i += 3) {
            fillBox(i, i);
        }
    }
    
    function fillBox(row, col) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(numbers);
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                solution[row + i][col + j] = numbers.pop();
            }
        }
    }
    
    function solveSudoku(grid) {
        const emptyCell = findEmptyCell(grid);
        if (!emptyCell) return true;
        
        const [row, col] = emptyCell;
        
        for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (solveSudoku(grid)) return true;
                
                grid[row][col] = 0;
            }
        }
        
        return false;
    }
    
    function findEmptyCell(grid) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] === 0) return [i, j];
            }
        }
        return null;
    }
    
    function isValidPlacement(grid, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num) return false;
        }
        
        for (let i = 0; i < 9; i++) {
            if (grid[i][col] === num) return false;
        }
        
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[boxRow + i][boxCol + j] === num) return false;
            }
        }
        
        return true;
    }
    
    function createPlayableBoard(cellsToRemove) {
        fixedCells = Array(9).fill().map(() => Array(9).fill(false));
        
        let removed = 0;
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (board[row][col] !== 0) {
                const backup = board[row][col];
                board[row][col] = 0;
                
                const tempBoard = board.map(row => [...row]);
                if (solveSudoku(tempBoard)) {
                    fixedCells[row][col] = false;
                    removed++;
                } else {
                    board[row][col] = backup;
                }
            }
        }
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] !== 0) {
                    fixedCells[i][j] = true;
                }
            }
        }
    }
    
    function updateGrid() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
                cell.value = board[i][j] === 0 ? '' : board[i][j];
                
                if (fixedCells[i][j]) {
                    cell.classList.add('fixed');
                    cell.readOnly = true;
                } else {
                    cell.classList.remove('fixed');
                    cell.readOnly = false;
                }
                
                cell.classList.remove('error');
            }
        }
    }
    
    function isBoardComplete() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) return false;
            }
        }
        return true;
    }
    
    function solvePuzzle() {
        if (confirm('Открыть решение?')) {
            board = solution.map(row => [...row]);
            updateGrid();
            showMessage('Показано решение.', 'info');
        }
    }
    
    function provideHint() {
        const emptyCells = [];
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) {
                    emptyCells.push([i, j]);
                }
            }
        }
        
        if (emptyCells.length === 0) {
            showMessage('Все клетки уже заполнены!', 'info');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const [row, col] = emptyCells[randomIndex];
        
        board[row][col] = solution[row][col];
        
        const cell = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
        cell.value = solution[row][col];
        
        validateCell(row, col);
        showMessage('Подсказка активирована.', 'info');
    }
    
    function validateCell(row, col) {
        const cell = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
        if (board[row][col] !== solution[row][col]) {
            cell.classList.add('error');
			currentHP = currentHP - 1;
        } else {
            cell.classList.remove('error');
            
            if (isBoardComplete()) {
                showMessage('Уровень пройден.', 'success');
            }
        }
		console.log(currentHP);
    }
    
    function clearUserInput() {
        if (confirm('Очистить все ответы?')) {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (!fixedCells[i][j]) {
                        board[i][j] = 0;
                        const cell = document.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
                        cell.value = '';
                        cell.classList.remove('error');
                    }
                }
            }
            clearMessage();
        }
    }
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function showMessage(text, type = 'error') {
        messageElement.textContent = text;
        messageElement.style.color = type === 'error' ? '#e74c3c' : 
                                    type === 'success' ? '#27ae60' : '#3498db';
    }
    
    function clearMessage() {
        messageElement.textContent = '';
    }

    function setConstraintsToInput(el, i, j){
        el.type = 'text';
        el.maxLength = 1;
        el.className = 'cell';
        el.dataset.row = i;
        el.dataset.col = j;
    }
});