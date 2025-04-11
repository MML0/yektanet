function validatePhone() {
    const phoneInput = document.getElementById('phone');
    const phoneValue = phoneInput.value;
    
    // Ensure only numeric values and correct length
    phoneInput.value = phoneValue.replace(/[^0-9]/g, '').slice(0, 11);
}

let password; 
let user_distance =68; 
console.log((window.innerHeight-400)/10);

let last_users =[];
let users = [];
console.log(users);
let competitionStarted = false;

function renderScoreboard() {
    const scoreboard = $('#scoreboard');
    scoreboard.empty(); 
    render_stars(users);

    // Render each user as a separate div
    users.forEach((user, index) => {
        const userDiv = $(`
            <div class="user" id="user-${user.uuid}" style="top: ${index * user_distance}px;">
                <div class="user-rank">${index+1}</div>
                <div class="div_avatar"><img class="img_avatar" src="${user.avatar}" alt="${user.name}'s avatar"></div>
                <div class="user-name">${user.name}</div>
                <div class="user-score">${user.score}</div>
            </div>
        `);
        scoreboard.append(userDiv);
        if(index==0){
            $(`#user-${user.uuid} > .div_avatar`).css('background-color', '#FCE205');
            $(`#user-${user.uuid} > .user-rank`).css('background-color', '#FCE205');
            $(`#user-${user.uuid} > .user-score`).css('background-color', '#FCE205');
            $(`#user-${user.uuid} > .user-name`).css('background-color', '#FCE205');
        }
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
                        const newPosition = index * user_distance; // user_distancepx for each user height including margin
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
                <div class="user" id="user-${user.uuid}" style="top: ${index * user_distance}px;">
                    <div class="user-rank">${index + 1}</div>
                    <div class="div_avatar"><img class="img_avatar" src="${user.avatar}" alt="${user.name}'s avatar"></div>
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

            const newPosition = index * user_distance; // user_distancepx for each user height including margin

            // Animate the movement
            
            $(`#user-${user.uuid}`).stop().animate({ top: newPosition }, 500); // Smooth animation over 500ms
            $(`#user-${user.uuid} > .user-rank`).text(`${index+1}`);
            $(`#user-${user.uuid} > .user-score`).text(`${user.score}`);
            $(`#user-${user.uuid} > .user-name`).text(`${user.name}`);
            if(newPosition!=parseInt($(`#user-${user.uuid}`).css('top'))){
                if(index==0){
                    setTimeout(() => {
                        $(`#user-${user.uuid} > .div_avatar`).css('background-color', '#FCE205');
                        $(`#user-${user.uuid} > .user-rank`).css('background-color', '#FCE205');
                        $(`#user-${user.uuid} > .user-score`).css('background-color', '#FCE205');
                        $(`#user-${user.uuid} > .user-name`).css('background-color', '#FCE205');
                    }, parseInt($(`#user-${user.uuid}`).css('top'))/user_distance*90+100);
                }
                if(parseInt($(`#user-${user.uuid}`).css('top'))==0){
                    setTimeout(() => {
                        $(`#user-${user.uuid} > .div_avatar`).css('background-color', '#ffffff');
                        $(`#user-${user.uuid} > .user-rank`).css('background-color',  '#ffffff');
                        $(`#user-${user.uuid} > .user-score`).css('background-color', '#ffffff');
                        $(`#user-${user.uuid} > .user-name`).css('background-color',  '#ffffff');
                    }, 50);
                }
                 
            if(parseInt(Math.floor(Math.random()+0.9))){
                rotate_star_i(index,parseInt($(`#user-${user.uuid}`).css('top')) > newPosition ? 1:0); 
                rotate_star_i(index,parseInt($(`#user-${user.uuid}`).css('top')) > newPosition ? 1:0); 
            }
            }

        }, index*90+100);

    });
    last_users = users
    render_stars(users);
    setTimeout(() => {
        renderScoreboard(); 
    }, 1800);
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
                    // if(parseInt(Math.floor(Math.random()+0.2))){
                    //     user.score += Math.floor(Math.random() * 100000); 
                    // }
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


});

function rotate_star_i(i, up) {
    const orientation_s = up ? -90 : 90;

    $('.star_left_' + i).animate(
        { rotation: orientation_s }, // Rotate to 90 or -90 degrees
        {
            duration: 500,
            step: function (now) {
                $(this).css('transform', `rotate(${now}deg)`);
            },
            complete: function () {
                // Immediately reset the rotation with no animation
                $(this).css({
                    transform: 'rotate(0deg)',
                    transition: 'none', // Ensure no transition effect
                });

                // Re-enable animations for subsequent animations
                setTimeout(() => {
                    $(this).css('transition', '');
                }, 10);
            },
        }
    );

    $('.star_right_' + i).animate(
        { rotation: -orientation_s }, // Rotate to -90 or 90 degrees
        {
            duration: 500,
            step: function (now) {
                $(this).css('transform', `rotate(${now}deg)`);
            },
            complete: function () {
                // Immediately reset the rotation with no animation
                $(this).css({
                    transform: 'rotate(0deg)',
                    transition: 'none', // Ensure no transition effect
                });

                // Re-enable animations for subsequent animations
                setTimeout(() => {
                    $(this).css('transition', '');
                }, 10);
            },
        }
    );
}

function render_stars(users) {
    existingStars = parseInt($('.star').length/2);

    starsToAdd = Math.max(0, users.length - existingStars);

    // Add the required stars
    for (let i = 0; i < starsToAdd; i++) {
        i=i+existingStars;
        newDiv = $('<div class="star star_left star_left_'+i+'"><img class="strimg" src="/noghte/score_board/app/image.png"></div> <div class="star star_right star_right_'+i+'"><img  class="strimg" src="/noghte/score_board/app/image.png" alt="" srcset=""></div>');
        $('.container').append(newDiv);
        rotate_star_i(i, 1)
    }
    existingStars = parseInt($('.star').length/2);


    for (let i = 0; i < existingStars; i++) {
        
        newPosition = i * user_distance -32; 
        $(`.star_left_${i}`).css({ top: newPosition });
        $(`.star_right_${i}`).css({ top: newPosition });
        $(`.star`).css({ opacity: 1 });
    }
}

function loged_in(){
    setInterval(() => {
        get_scores();
    }, 2000);

    get_scores();
    setTimeout(() => {
        renderScoreboard(); 
    }, 100);

}