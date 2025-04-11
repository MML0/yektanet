function validatePhone() {
    const phoneInput = document.getElementById('phone');
    const phoneValue = phoneInput.value;
    
    // Ensure only numeric values and correct length
    phoneInput.value = phoneValue.replace(/[^0-9]/g, '').slice(0, 11);
}

let password; 
let last_users =[];
let users = [];
console.log(users);
let competitionStarted = false;

function renderScoreboard() {
    const scoreboard = $('#scoreboard');
    scoreboard.empty(); 

    // Render each user as a separate div
    users.forEach((user, index) => {
        const userDiv = $(`
            <div class="user" id="user-${user.uuid}" style="top: ${index * 45}px;">
                <div class="user-rank">${index+1}</div>
                <img src="${user.avatar}" alt="${user.name}'s avatar">
                <div class="user-name">${user.name}</div>
                <div class="user-score">${user.score}</div>
            </div>
        `);
        scoreboard.append(userDiv);
    });

    // Update attendance count
    //$('#attendance-info').text(`Attending: ${users.length}`);
}

function updateScoreboard() {
    // Sort users by score in descending order
    users.sort((a, b) => b.score - a.score);
    if (last_users.length==0){
        renderScoreboard(); 
        last_users = users
        
    }
    last_users.forEach((lastUser) => {
        // Check if the user is not in the 'users' array based on UUID
        if (!users.some(user => user.uuid === lastUser.uuid)) {
            // Find the element by UUID and apply a fade out animation
            $(`#user-${lastUser.uuid}`).stop().fadeOut(500, function() {
                // Remove the user from the last_users array
                $(`#user-${lastUser.uuid}`).remove();
                const index = last_users.findIndex(user => user.uuid === lastUser.uuid);
                if (index > -1) {
                    last_users.splice(index, 1); // Remove from the array
                }
    
                // Shift other users and update the scoreboard
                users.forEach((user, index) => {
                    setTimeout(() => {
                        const newPosition = index * 45; // 45px for each user height including margin
                        $(`#user-${user.uuid}`).stop().animate({ top: newPosition }, 500); // Smooth animation over 500ms
                    }, index * 150); // Stagger animations
                });
            });
        }
    });
    const scoreboard = $('#scoreboard');

    users.forEach((user, index) => {
        // Find new users that are in 'users' but not in 'last_users'
        if (!last_users.some(lastUser => lastUser.uuid === user.uuid)) {
            // Render the new users
            index = index + last_users.length
            userDiv = $(`
                <div class="user" id="user-${user.uuid}" style="top: ${index * 45}px;">
                    <div class="user-rank">${index + 1}</div>
                    <img src="${user.avatar}" alt="${user.name}'s avatar">
                    <div class="user-name">${user.name}</div>
                    <div class="user-score">${user.score}</div>
                </div>
            `);
            setTimeout(() => {
                scoreboard.append(userDiv); // Append the new user div to the scoreboard
            }, 100);
        }
    });
    
    users.forEach((user, index) => {
        // Calculate the new position

        setTimeout(() => {
            const newPosition = index * 45; // 45px for each user height including margin

            // Animate the movement
            
            $(`#user-${user.uuid}`).stop().animate({ top: newPosition }, 500); // Smooth animation over 500ms
            $(`#user-${user.uuid} > .user-rank`).text(`${index+1}`);
            $(`#user-${user.uuid} > .user-score`).text(`${user.score}`);
            $(`#user-${user.uuid} > .user-name`).text(`${user.name}`);

        }, index*120+100);

    });
    last_users = users

}

function get_scores() {
    $.ajax({
        url: '/noghte/scoreboard_data.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ password: password }),
        success: function (result) {
            if (result.status === 'success') {
                $('#attendance-info').text(`Attending: ${result.joined_count}`);
                users = result.top_10_users
                users.forEach((user, index) => {
                    user.name = user.first_name + ' ' + user.last_name;
                    delete user.id;
                    //user.score += Math.floor(Math.random() * 100); 
                });
                updateScoreboard(); 
                              
            } else {
                
                iziToast.error({
                    title: 'Error',
                    message: result.message,
                    position: 'topRight',
                });
            }
        },
        error: function (result ) {
            iziToast.error({
                title: 'Error',
                message: result.message,
                position: 'topRight',
            });
        },
    });

}

$(document).ready(function () {
    
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
    }, {});

    $.ajax({
        url: '/noghte/answer_api.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ action: 'get_next_question' }),
        success: function (result) {
            if (result.status === 'success') {
                if (result.started === true) {
                    competitionStarted = true;
                    $('#start-btn').remove();
                    $('#next-btn').show(); 
                }
                
            } 
        },
        error: function (result ) {
            iziToast.error({
                title: 'Error',
                message: result.message,
                position: 'topRight',
            });
        },
    });

    if (cookies.loggedIn === 'true' && cookies.password) {
       
        password = cookies.password;

        $('.center').remove();
        $('.container').css('display', 'block');
        iziToast.success({
            title: 'ورود',
            message: `خوش آمدید`,
            position: 'topRight',
        });
      
        loged_in()

    } else {
        console.log('User is not logged in');
    }

    $('#login-form').on('submit', function (e) {
        e.preventDefault();
    
        password = $('#password').val();
        document.cookie = `password=${password}; path=/; max-age=3600;`;
        document.cookie = `loggedIn=true; path=/; max-age=3600;`;
        $('.center').remove();
        $('.container').css('display', 'block');
        iziToast.success({
            title: 'ورود',
            message: `خوش آمدید`,
            position: 'topRight',
        });
      
        loged_in()

    });

    // Start competition
    $('#start-btn').on('click', function () {
        $.ajax({
            url: '/noghte/competition_stat.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ password: password , action: 'start'}),
            success: function (result) {
                if (result.status === 'success') {
                    iziToast.success({
                        title: 'started',
                        message: `starting is  ${result.remain}s `,
                        position: 'topRight',
                    });
                    competitionStarted = true;
                    starting_timer(result.remain)
                    $('#start-btn').prop('disabled', true).text('Competition Started');
                    $('#start-btn').remove();
                    $('#next-btn').show(); // Enable the "Next" button
                    renderScoreboard(); 


                } else {
                    
                    iziToast.error({
                        title: 'Error',
                        message: result.message,
                        position: 'topRight',
                    });
                }
            },
            error: function (result ) {
                iziToast.error({
                    title: 'Error',
                    message: result.message,
                    position: 'topRight',
                });
            },
        });

    });
    $('#reset-btn').on('click', function () {
        $.ajax({
            url: '/noghte/competition_stat.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ password: password , action: 'reset'}),
            success: function (result) {
                if (result.status === 'success') {
                    iziToast.success({
                        title: 'started',
                        message: ` ${result} `,
                        position: 'topRight',
                    });
                    location.reload()

                } else {
                    
                    iziToast.error({
                        title: 'Error',
                        message: result.message,
                        position: 'topRight',
                    });
                }
            },
            error: function (result ) {
                iziToast.error({
                    title: 'Error',
                    message: result.message,
                    position: 'topRight',
                });
            },
        });

    });

    // Next round
    $('#next-btn').on('click', function () {
        $.ajax({
            url: '/noghte/answer_api.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ password: password , action: 'next_question'}),
            success: function (result) {
                if (result.status === 'success') {
                    iziToast.success({
                        title: 'naxt',
                        message: `starting in10 q${result.current} `,
                        position: 'topRight',
                    });
                    competitionStarted = true;
                    starting_timer(result.remain)


                } else {
                    
                    iziToast.error({
                        title: 'Error',
                        message: result.message,
                        position: 'topRight',
                    });
                }
            },
            error: function (result ) {
                iziToast.error({
                    title: 'Error',
                    message: result.message,
                    position: 'topRight',
                });
            },
        });

    });
});


function loged_in(){
    setInterval(() => {
        get_scores();
    }, 3000);
    get_scores();
    setTimeout(() => {
        renderScoreboard(); 
    }, 100);

}

function starting_timer(duration){
    const $timer = $(".loading-text");

    $('#loading').css('opacity', 0);
    $('#loading').css('display', 'flex');
    $('.loading-text').text('');
    $('#loading').animate({ opacity: 1 }, 500); 


    let remainingTime = duration;
    $timer.text('start in '+remainingTime);


    const interval = setInterval(() => {
        remainingTime--;
        $timer.text('start in '+remainingTime);


        if (remainingTime <= 0) {
            clearInterval(interval);
            iziToast.success({
                title: 'start!',
                message: 'start.',
                position: 'topRight',
            });
            $('#loading').animate({ opacity: 0 }, 500); 
            setTimeout(() => {$('#loading').css('display', 'none');},500);
           
        }
    }, 1000);
}