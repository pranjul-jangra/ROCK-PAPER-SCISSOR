// computer picking a random prediction:
let computerSelect;
const computerImage = document.querySelector('#computerImage');
let images = ['./assets/rock.png', './assets/paper.png', './assets/scissor.png'];

function computerChoice() {
    let options = ["rock", "paper", "scissor"];
    let idx = Math.floor(Math.random() * 3);
    computerSelect = options[idx];
    computerImage.style.cssText = `background-image: url(${images[idx]});`;
    return computerSelect;
}

//user picking his/her prediction and checking the win:
let userSelect;
const userImage = document.querySelector('#userImage');

let list = document.querySelectorAll("img");
for (let element of list) {
    element.addEventListener("click", () => {
        userSelect = element.getAttribute("id");
        const userIndex = element.getAttribute('data-number');
        userImage.style.cssText = `background-image: url(${images[userIndex]});`;
        list.forEach((element) => {
            element.style.pointerEvents = "none";
        });
        computerChoice();
        winningProbability();
        scores();
        localStorage.setItem('userCount', userCount);
        localStorage.setItem('computerCount', computerCount);
    });
}

const userScore = document.getElementById("user_score");
const computerScore = document.getElementById("computer_score");
let userCount = parseInt(localStorage.getItem('userCount')) || 0;
let computerCount = parseInt(localStorage.getItem('computerCount')) || 0;

userScore.innerText = userCount;
computerScore.innerText = computerCount;
let gameResult = null;

//function to calculate winning:
let message = document.querySelector("#message");
let winningProbability = () => {
    if (userSelect == computerSelect) {
        message.innerText = "game draw!";
        gameResult = 'draw';
    } else if (userSelect == "rock") {
        if (computerSelect == "paper") {
            message.innerText = "oops! you lose.";
            computerScore.innerText = ++computerCount;
            gameResult = 'loose';
        } else {
            message.innerText = "congratulations. you win.";
            userScore.innerText = ++userCount;
            gameResult = 'win';
        }
    } else if (userSelect == "paper") {
        if (computerSelect == "scissor") {
            message.innerText = "oops! you lose.";
            computerScore.innerText = ++computerCount;
            gameResult = 'loose';
        } else {
            message.innerText = "congratulations. you win.";
            userScore.innerText = ++userCount;
            gameResult = 'win';
        }
    } else if (userSelect == "scissor") {
        if (computerSelect == "rock") {
            message.innerText = "oops! you lose.";
            computerScore.innerText = ++computerCount;
            gameResult = 'loose';
        } else {
            message.innerText = "congratulations. you win.";
            userScore.innerText = ++userCount;
            gameResult = 'win';
        }
    }
}

//new game button to reset all changes:
let btn = document.querySelector("button");
btn.addEventListener("click", () => {
    userCount = 0;
    computerCount = 0;
    localStorage.setItem('userCount', userCount);
    localStorage.setItem('computerCount', computerCount);
    userScore.innerText = localStorage.getItem('userCount');
    computerScore.innerText = localStorage.getItem('computerCount');
});

//notify user about win:
const notify = document.querySelector('#notify');
const closeButton = document.querySelector('#closeButton');

closeButton.addEventListener('click', () => {
    notify.style.cssText = 'transform: translateY(-70vh); opacity: 0;';
    list.forEach((element) => {
        element.style.pointerEvents = "all";
    });
});

function scores() {
    if (gameResult == 'win') {
        message.style.cssText = "color:green;";
    } else if (gameResult == 'loose') {
        message.style.cssText = "color:red;";
    } else {
        message.style.cssText = "color:black;";
    }
    notify.style.cssText = 'transform: translateY(0); opacity: 1;'
}