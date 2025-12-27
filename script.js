class QuizGame {
  selectors = {
    root: '[data-js-root]',
    firstScore: '[data-js-first-score]',
    secondScore: '[data-js-second-score]',
    question: '[data-js-question]',
    category: '[data-js-category]',
    listOptions: '[data-js-list]',
    options: '[data-js-item]',
    button: '[data-js-button]',
    nextButton: '[data-js-next-button]',
    finalResult: '[data-js-final-result]',
    firstFinalPoint: '[data-js-first-final-point]',
    secondFinalPoint: '[data-js-second-final-point]',
    resetButton: '[data-js-reset-button]',
  }

  url = 'https://opentdb.com/api.php?amount=10&type=multiple'
  
  data = null
  
  initialState = {
    currentQuestionIndex: 0,
    score: 0,
  }

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root)
    this.firstScore = this.rootElement.querySelector(this.selectors.firstScore)
    this.secondScore = this.rootElement.querySelector(this.selectors.secondScore)
    this.question = this.rootElement.querySelector(this.selectors.question)
    this.category = this.rootElement.querySelector(this.selectors.category)
    this.listOptions = this.rootElement.querySelector(this.selectors.listOptions)
    this.options = this.rootElement.querySelectorAll(this.selectors.options)
    this.nextButton = this.rootElement.querySelector(this.selectors.nextButton)
    this.button = this.rootElement.querySelectorAll(this.selectors.button)
    this.finalResult = document.querySelector(this.selectors.finalResult)
    this.firstFinalPoint = this.finalResult.querySelector(this.selectors.firstFinalPoint)
    this.secondFinalPoint = this.finalResult.querySelector(this.selectors.secondFinalPoint)
    this.resetButton = this.finalResult.querySelector(this.selectors.resetButton)
    this.step = 'answer'
    this.allQuestion = 0
    this.currentQuestionIndex = this.initialState.currentQuestionIndex
    this.score = this.initialState.score
    this.bindEvents()
    this.init()
  }
  
  async init() {
    await this.getQuestions()
    this.startQuiz()
  }
  
  async restartGame() {
    this.question.innerHTML = "Loading new questions...";
    
    await this.getQuestions()
    
    this.currentQuestionIndex = 0
    this.score = 0
    this.step = 'answer';
    this.nextButton.textContent = 'check answer';

    this.button.forEach(element => {
      element.style.backgroundColor = 'rebeccapurple'
      element.disabled = false
    })
    
    this.showQuestions()
  }
  
  startQuiz() {
    this.currentQuestionIndex = 0
    this.score = 0
    this.showQuestions()
  }
   
  async getQuestions() {
    const url = this.url
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) throw new Error (`${response.status}`)
      
      this.data = await response.json()
      
    } catch (error) {
      console.error(error)
    }
  }

  showQuestions () {
    const currentQuestions = this.data.results[this.currentQuestionIndex]
    this.allQuestion = this.data.results.length

    console.log(this.data.results.length)
    console.log(currentQuestions)
    
    const answers = {
      correct_answer: currentQuestions.correct_answer,
      incorrect_answers: currentQuestions.incorrect_answers
    }
    
    const allAnswers = [
      {text: answers.correct_answer, isCorrect: true},
      ...answers.incorrect_answers.map(element => (
        {
          text: element,
          isCorrect: false
        }
      ))
    ]
    
    const question = this.data.results[this.currentQuestionIndex].question
    const randomAnswers = allAnswers.sort(() => Math.random() - 0.5)
    
    console.log(question)
    console.log(randomAnswers)
    
    this.firstScore.innerHTML = this.currentQuestionIndex + 1
    this.secondScore.innerHTML = this.allQuestion
    this.category.innerHTML = currentQuestions.category
    this.question.innerHTML = question
    
    this.options.forEach((element, index) => {
      element.textContent = randomAnswers[index].text
      element.dataset.correct = randomAnswers[index].isCorrect
      console.log(element.textContent)
    })
  }
  
  bindEvents() {
    let currentSpan = null
    let currentButton = null
    
    this.listOptions.addEventListener('click', (element) => {
      const button = element.target.closest(this.selectors.button)
      currentButton = button
      
      if (element.target.hasAttribute('data-js-button')) {
        const span = button.querySelector('span')
        
        currentSpan = span

        if (span.dataset.correct  === 'true') {
          
          this.score++

          this.button.forEach(element => {
            console.log(element)
            element.disabled = true
          })

          currentButton.style.backgroundColor = 'gray'

        } else if (span.dataset.correct  === 'false') {

          currentButton.style.backgroundColor = 'gray'

          this.button.forEach(element => {
            console.log(element)
            element.disabled = true
          })
        }
      }
    })

    this.nextButton.addEventListener('click', (nextBtn) => {
      if (this.step === 'answer') {
        
        console.log(this.allQuestion)
        console.log(this.currentQuestionIndex + 1)
        
        if (currentSpan.dataset.correct  === 'true') {

          currentButton.style.backgroundColor = 'green'

        } else if (currentSpan.dataset.correct  === 'false') {

          currentButton.style.backgroundColor = 'red'
          
          currentSpan = this.listOptions.querySelector('span[data-correct="true"]')
          currentSpan.closest('button').style.backgroundColor = 'green'
        }

        if (this.currentQuestionIndex + 1 >= this.allQuestion) {

          this.nextButton.textContent = 'show final results'
          this.step = 'show final results'
        } else {
          
          this.nextButton.textContent = 'next question'
          this.step = 'next'
        }
        
      } else if (this.step === 'next') {
        this.currentQuestionIndex++
        
        this.button.forEach(element => {
          element.style.backgroundColor = 'rebeccapurple'
          element.disabled = false
        })
        
        this.showQuestions ()

        this.nextButton.textContent = 'check answer'
        
        this.step = 'answer'
      } else if (this.step === 'show final results'){
        
        this.rootElement.classList.remove('is-active')
        this.finalResult.classList.add('is-active')
        this.firstFinalPoint.textContent = this.score
        this.secondFinalPoint.textContent = this.currentQuestionIndex + 1
        
      }
    })
    
    this.resetButton.addEventListener('click', () => {
      this.finalResult.classList.remove('is-active')
      this.rootElement.classList.add('is-active')
      this.restartGame()
    })
  }
}

new QuizGame()