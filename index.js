const TelegramBot = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options')
const token = '8356061371:AAHxI9K8w51b_LaDvcBgsKaQ09n7iyxkrqw'

const bot = new TelegramBot(token, {polling: true})

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен её угадать!`)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Сыграть в игру, угадай число!'},
    ])

    bot.on('message',  async msg=> {
        const text = msg.text
        const  chatId = msg.chat.id

        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/2ad/834/2ad8341a-31fd-36c7-9af3-10820cfcbe51/1.webp')
            return bot.sendMessage(chatId, `Добро пожаловать в телеграмм бот тест `)
        }
        if (text === '/info') {
            return bot.sendMessage(chatId, `Тебя зовут ${msg.from.username}`)
        }
        if (text === '/game') {
            startGame(chatId)
        }
        return bot.sendMessage(chatId,'Я тебя не понимаю, поробуй ещё раз!')
    })

    //Отслеживания события callback_query
    bot.on('callback_query', msg => {
        const data = msg.data
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId)
        }
        if (data === chats[chatId]) {
            return bot.sendMessage(chatId, `Поздравляю ты отгадал цифру ${chats[chatId]}`, againOptions)
        } else {
            return bot.sendMessage(chatId, `К сожелению ты не угадал, бот выбрал цифру ${chats[chatId]}`, againOptions)
        }
    })
}

start()
