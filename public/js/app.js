let username;
let socket = io();
do {
    username = prompt('Enter your name');
} while (!username);
const textarea = document.querySelector('#textarea');
const submitBtn = document.querySelector('#submitBtn');
const commentBox = document.querySelector('.comment_box');

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let comment = textarea.value;
    if (!comment) return;
    postComment(comment);
})
function postComment(comment) {
    // Append to DOM
    let data = {
        username: username,
        comment: comment
    }
    appendToDom(data);
    textarea.value = '';

    // Broadcast
    BroadcastComment(data);
    //sync with Mongodb
    syncWithDb(data);
}

function appendToDom(data) {
    let liTag = document.createElement('li');
    liTag.classList.add('comment', 'mb-3');

    let markup = `
            <div class="card border-light mb-3">
                <div class="card-body">
                    <h6>${data.username}</h6>
                    <p>${data.comment}</p>
                    <div>
                        <img src="/img/clock.png" alt="clock">
                        <small>${moment(data.time).format('LT')}</small>
                    </div>
                </div>
            </div>
    `;

    liTag.innerHTML = markup;
    commentBox.prepend(liTag);
}

function BroadcastComment(data) {
    //socket
    socket.emit('comment', data);
}

let timerId = null;
function debounce(func, timer) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => { func(); }, timer);
}

socket.on('comment', (data) => {
    appendToDom(data);
});

let typingDiv = document.querySelector('.typing');

socket.on('typing', (data) => {
    typingDiv.innerHTML = `${data.username} is typing...`;
    debounce(function () {
        typingDiv.innerHTML = '';
    }, 1000);
});

// Add an event listner on textarea
textarea.addEventListener('keyup', (e) => {
    socket.emit('typing', { username });
});

//API calls to sync data into database;
function syncWithDb(data) {
    const header = {
        'Content-Type': 'application/json'
    }

    fetch('/api/comments',
        {
            method: 'Post',
            body: JSON.stringify(data),
            headers: header
        }
    ).then(res => res.json())
        .then(result => { console.log(result); });
}

//API calls to fetch data from database;
function fetchComments() {
    fetch('/api/comments')
        .then(res => res.json())
        .then(result => {
            result.forEach(comment => {
                comment.time = comment.createAt
                appendToDom(comment)
            });
        });
}

window.onload = fetchComments;