const tdElements = document.querySelectorAll('#categories td');
let selectedCategory = '';

function changeColor(element) {
    console.log(element)
    tdElements.forEach(td => {
        td.style.backgroundColor = '';
    });
    element.style.backgroundColor = "#FEC200";
    selectedCategory = element.innerText;


    getQuestionsFromDB()
        .then(data => {
            const filteredQuestions = data.results.filter(question => {     // eliminate true,false questions
                 return question.type !== "boolean"
            })
            eventListeners(filteredQuestions);
        }).catch(error => error.message)

}

const startBtn = document.querySelector('#start-btn');
const gameContent = document.getElementById('game-content');
const questionContent = document.getElementById('question-content');
const questionTag = document.querySelector('#question-content h2');
const options = document.querySelectorAll('.list-group-item-text');
const listGroup = document.querySelector('.list-group');
const currentQNum = document.querySelector('#question-num-item');


// Api Categories URL ==> 20 questions per caterogy ???? check it 
const url = {
    'Books': 'https://opentdb.com/api.php?amount=20&category=10&difficulty=medium',
    'Films': 'https://opentdb.com/api.php?amount=20&category=11',
    'Music': 'https://opentdb.com/api.php?amount=20&category=12',
    'Math': 'https://opentdb.com/api.php?amount=20&category=18',
    'Sport': 'https://opentdb.com/api.php?amount=20&category=21',
    'Geography': 'https://opentdb.com/api.php?amount=10&category=22',
    'History': 'https://opentdb.com/api.php?amount=20&category=23',
    'Politic': 'https://opentdb.com/api.php?amount=20&category=23',
    'Art': 'https://opentdb.com/api.php?amount=20&category=25'
}

let selectedAnswer = '';
let totalCorrect = 0;
let countQ = 1;


function getQuestionsFromDB() {
    const currentURL = url[selectedCategory];
    console.log(selectedCategory);
    console.log(currentURL);
    return fetch(currentURL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.response_code !== 0) {
                throw new Error(`Error in API response! Response Code: ${data.response_code}`);
            }
            return data;
        })
        .catch(error => console.error(error));
}


function eventListeners(questions) {
    // starting game
    startBtn.addEventListener('click', () => startGame(questions));  // function'ı arrow olmadan yazarsak direk çağırıyor, böyle ise tıklamamızı bekliyor.

    // choosing option
    listGroup.addEventListener('click', (e) => choosingOption(e, questions));

    // Next question
    document.querySelector('.fa-right-long').addEventListener('click', () => skipQuestion(questions));
}


function startGame(questions) {
    if (selectedCategory === '') {
        alert('Please select a category first !!');
        return;
    }
    gameContent.style.display = 'none';
    questionContent.style.display = 'block';

    skipQuestion(questions);
}



const askedBefore = [];
function skipQuestion(questions) {
    listGroup.querySelectorAll('.list-group-item').forEach(item => {
        item.style.pointerEvents = 'auto';
    });
    // Random bir soru seçicem, her seçtiğim soruyu dahaÖnceSorulanlar diye arrray yapcam, bir sonraki soru bu array'de varsa geçicem, başka soru bakcam.

    // Doğru yanıtı şıklardan birine rastgele dağıt
    const randomNumber = Math.floor(Math.random() * 4); // for options
    const randomQuestionNumber = Math.floor(Math.random() * questions.length)  // for question
    const currentQ = questions[randomQuestionNumber];   

    if (!askedBefore.includes(currentQ)) {       
        askedBefore.push(currentQ)

        questionTag.innerText = currentQ.question;
        const qArr = currentQ.incorrect_answers
        qArr.splice(randomNumber, 0, currentQ.correct_answer);
        console.log(qArr);
        options.forEach((option, index) => {
            option.innerText = qArr[index];
            option.parentElement.style.background = '#84defa';
        })
        currentQNum.textContent = countQ;
        countQ++;
        console.log('İlk bölge')
        console.log(askedBefore)
    } else {
        skipQuestion(questions);
        console.log('İkinci bölge')
    }

    if (countQ > 9) {
        questionContent.style.display = 'none';
        scoreResult();
    }
}


function scoreResult() {
    document.querySelector('#score-content').style.visibility = 'visible';
    document.querySelector('#score > :first-child').textContent = totalCorrect;

    let scoreExplanation = document.querySelector('#score-content-explanation h2');
    switch (true) {
        case totalCorrect <= 2:
            scoreExplanation.textContent = "Lol noob !!"
            break;
        case totalCorrect > 2 && totalCorrect <= 4:
            scoreExplanation.textContent = "Not bad !!"
            break;
        case totalCorrect > 4 && totalCorrect <= 6:
            scoreExplanation.textContent = "Good job bro !!"
            break;
        case totalCorrect > 6:
            scoreExplanation.textContent = "Wow You did this !!"
            break;
    }

    const percentage = (totalCorrect / 8) * 100;
    const scoreCircle = document.querySelector('#score-circle');
    scoreCircle.style.background = `conic-gradient(#C4D563 0% ${percentage}%,#F76162 ${percentage}% 100%)`; 
    scoreCircle.style.borderRadius = '50%';
    scoreCircle.style.width = '100px';
    scoreCircle.style.height = '100px';
    scoreCircle.style.position = 'relative'; 
    scoreCircle.style.margin = 'auto'; 

    const percentageText = document.createElement('span');
    percentageText.textContent = `${percentage.toFixed(0)}%`;
    percentageText.style.color = 'white';
    percentageText.style.fontSize = '4rem';
    percentageText.style.fontWeight = 'bold'; 
    percentageText.style.position = 'absolute';
    percentageText.style.top = '50%';
    percentageText.style.left = '50%';
    percentageText.style.transform = 'translate(-50%, -50%)';
    scoreCircle.appendChild(percentageText);
}


function choosingOption(e, questions) {
    e.preventDefault();
    const clickedElement = e.target;
    console.log(clickedElement)
    if (clickedElement.classList.contains('list-group-item') || clickedElement.parentElement.classList.contains('list-group-item')) {
        const li = clickedElement.closest('li');
        li.style.backgroundColor = '#eb6434';
        selectedAnswer = clickedElement.textContent.trim();
        console.log(selectedAnswer)

        console.log(questions)

        const selectedQuestion = questions.find(question => question.incorrect_answers.includes(selectedAnswer) || question.correct_answer === selectedAnswer)
        console.log(selectedQuestion) 

        listGroup.querySelectorAll('.list-group-item').forEach(item => {
            item.style.pointerEvents = 'none';
        });

        const rightAnsweredLi = Array.from(listGroup.children).find(li => li.querySelector('label').textContent.trim() === selectedQuestion.correct_answer);

        setTimeout(function () {
            if (selectedQuestion.correct_answer !== selectedAnswer) {
                li.style.backgroundColor = 'red';
                rightAnsweredLi.style.backgroundColor = 'green';   // doğru yanıt olan li element'ini green yap
                totalWrong++;
            } else {
                li.style.backgroundColor = 'green';
                totalCorrect++;
            }
        }, 500)


    }
}





