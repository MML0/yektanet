function validateUserID() {
    const userIDInput = document.getElementById('user_id');
    const userIDValue = userIDInput.value;
    // Allow only alphanumeric characters and enforce the length limit
    //userIDInput.value = userIDValue.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
}


let id; 
let phone; 
let answer; 
let remainingTime = 20;
let startremainingTime = 0;
let answer_flag = false;
let avatar_i = 0;

$(document).ready(function () {
    

    //competition_started(result)
    //end_competition(result)

    
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
    }, {});

    if (cookies.loggedIn === 'true' && cookies.phone) {
        phone = cookies.phone;
        $.ajax({
            url: '/noghte/login.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ phone: phone }),
            success: function (result) {
                if (result.status === 'success') {
                    loged_in(result);
                    
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

    } else {
        console.log('User is not logged in');
    }



    $('#login-form').on('submit', function (e) {
        e.preventDefault();

        phone = $('#user_id').val();

        $.ajax({
            url: '/noghte/login.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ phone: phone }),
            success: function (result) {
                if (result.status === 'success') {
                    document.cookie = `phone=${phone}; path=/; max-age=3600;`;
                    document.cookie = `loggedIn=true; path=/; max-age=3600;`;
                    loged_in(result);
                    
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
     
    $('.answer').on('click', function (e) {
        e.preventDefault();
        if(answer_flag){return}
        $('.answer').css('background', '#f2f2f2');
        $('.answer').css('color', '#a2a2a2');
        answer = $(this).attr('answer');
        $(this).css('background', '#212121');
        $(this).css('color', '#ffffff');
        answer_flag = true
        question_id = $(this).attr('question_id');
        $('#loading').css('display', 'flex');
        $('.timer_number').text('');
        $('.loading-text').text('لطفاً صبر کنید');
        $('#loading').animate({ opacity: 1 }, 1000); 

        $('.timer_text').css('visibility', 'hidden');
        $('.rules_section').css('visibility', 'hidden');
        $('.numberOfquestions_section').css('visibility', 'hidden');

        $.ajax({
            url: '/noghte/answer_api.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ phone: phone,question_id: question_id,action: 'answer',answer:answer,remained_time:remainingTime }),
            success: function (result) {
                if (result.status === 'success') {
                    $('#loading').css('display', 'flex');
                    $('.loading-text').text('لطفاً صبر کنید');
                    $('#loading').animate({ opacity: 1 }, 500); 
                    setTimeout(() => {
                        $('#loading').animate({ opacity: 0 }, 500); 
                        setTimeout(() => {$('#loading').css('display', 'none');},500);
                        
                        $('.user-info > .user-score').text(result.updated_score);
                        $('.answer'+answer).css('background', '#212121');
                        $('.answer'+result.correct_answer.replace("a",'')).css('background', '#1fac00');
                        $('.answer'+result.correct_answer.replace("a",'')).css('color', '#ffffff');
                    }, remainingTime*1000);
                    
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
                    message: result,
                    position: 'topRight',
                });
            },
        });
    });

});

function choose_avatar(result){
    console.log('chooooo');
    $('.choose_avatar_div').css('display', 'flex');
    $('.choose_avatar_div').animate({ opacity: 1 }, 500); 
    // loged_in(result)
    for (let i = 0; i < 20; i++) {
        newDiv = $('<div class="avtrimg_div" i="'+(i+1)+'"><img class="avtrimg" src="/noghte/user/resource/avatar_'+(i+1)+'.png"></div>');
        $('.avatars_pic').append(newDiv);        
    }
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            $($('.avtrimg_div')[i]).animate({ opacity: 1 }, 500); // Smooth animation over 500ms
        }, i*70+1000);   
    }
    last_result = result

    $('.choose_avatae_btn').on('click', function (e) {
        $.ajax({    
            url: '/noghte/choose_avatar.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ phone: phone,'i': parseInt(avatar_i) }),
            success: function (result) {
            if (result.status === 'success') {
                $('.user-avatar > img').attr('src','/noghte/user/resource/avatar_'+(avatar_i)+'.png');
                last_result.user.avatar = '/noghte/user/resource/avatar_'+(avatar_i)+'.png'
                loged_in(last_result)
                $('.choose_avatar_div').animate({ opacity: 0}, 500); 
                setTimeout(() => {
                $('.choose_avatar_div').css('display', 'none');
                    
                }, 500);
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
                message: result,
                position: 'topRight',
        });
            },
        });

    });

    $('.avtrimg_div').on('click', function (e) {
        e.preventDefault();

        avatar_i = $(this).attr('i')
        $('.avtrimg_div').removeClass('avtrimg_div_select');
        $(this).addClass('avtrimg_div_select');
        $('.choose_avatae_btn').prop('disabled', false);
     });

}
function loged_in(result){
    $('.center').animate({ opacity: 0 }, 500).after().remove();
    

    $('.user-info > .user-name').text(result.user.first_name+' '+result.user.last_name);
    $('.user-info > .user-score').text(result.user.score);
    $('.user-avatar > img').attr('src',result.user.avatar);
    $('.user-data').css('display', 'flex');
    $('.score').text(result.user.score);

    if($('.user-avatar > img').attr('src').includes('avatar_0.')){
        console.log('chooooo');
        choose_avatar(result); 
        return        
    }else{
        console.log('ok avatar');
    }

    $('.timer_section').css('visibility', 'hidden');
    $('#loading').css('opacity', 0);
    $('#loading').css('display', 'flex');
    $('#loading').animate({ opacity: 1 }, 500); 

    stat_checker_iterval = setInterval(() => {      
        $.ajax({
            url: '/noghte/answer_api.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ action: 'get_next_question',phone:phone }),
            success: function (result) {
                if (result.status === 'success') {
                    if (result.ended !== undefined && result.ended !== null) {
                        if (result.ended === true) {
                            clearInterval(stat_checker_iterval);
                            end_competition(result);

                        }
                    }
                    if (result.is_next_question_ready === true) {
                        $('.timer_section').css('visibility', 'visible');
                        starting_remain_timer(parseInt(result.remaining/1000))
                        clearInterval(stat_checker_iterval);
                        setTimeout(() => {

                            competition_started(result);
                            
                        }, result.remaining);
                    }
                    
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
    },  7000);


    iziToast.success({
        title: 'ورود',
        message: `خوش آمدید, ${result.user.first_name} ${result.user.last_name}!`,
        position: 'topRight',
    });
}
const result = {
    data: {
        text: "پرترافیک ترین ساعات بازدید کاربران از وبسایت های ایرانی از طریق تلفن همراه چه ساعاتی است؟",
        a1: "دستشوئی و استحمام",
        a2: "ورزش",
        a3: "خوردن صبحانه",
        a4: "چک کردن شبکه های اجتماعی"
    },
    current_question: 1
};

function competition_started(result) {
    
    $('.question_box > h2').text(result.data.text);
    $('.answer1').text(result.data.a1);
    $('.answer2').text(result.data.a2);
    $('.answer3').text(result.data.a3);
    $('.answer4').text(result.data.a4);
    $('.answer').attr('question_id',result.current_question);
    $('.answer').css('background', '#ffffff');
    $('.answer').css('color', '#212121');
    start_timer();
    //$('.container').css('display', 'flex');
    $('#loading').animate({ opacity: 0 }, 500); 
    setTimeout(() => {$('#loading').css('display', 'none');},500);
   
}

function deleteCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=" + new Date(0).toUTCString() + ";path=/";
    }
}
function end_competition(result){
    setTimeout(function() {


        $('#loading').animate({ opacity: 0 }, 500); 
        setTimeout(() => {$('#loading').css('display', 'none');},500);    
        $('.end_rank_num').text(result.rank);
        if (result.rank==1){
            $('.end_rank_text').text('شما برنده شدید.');
            $('.end_comp_text').text('تبریک!');
            $('.end_rank_num').text('');
        }
        $('.container').animate({ opacity: 0 }, 500); 
        setTimeout(() => {$('.container').css('display', 'none');},500);
        $('.end_div').css('display', 'flex');
        $('.end_div').animate({ opacity: 1 }, 800); 
      }, 1000);
}

// for each question 20 sec
function start_timer(){
    const duration = 15; 
    const $timer = $(".end_timer_section > .timer_number");
    const $container = $(".container");
    answer_flag = false;
    $container.show();
    $('.end_timer_section').css('visibility', 'visible'); 
    $('.end_timer_section').animate({ opacity: 1 }, 500); 
    remainingTime = duration;
    $timer.text(remainingTime);


    const interval = setInterval(() => {
        remainingTime--;
        $timer.text(remainingTime);

        if (remainingTime <= 0) {
            clearInterval(interval);
            //$timer.text("  ");
            $('.end_timer_section').animate({ opacity: 0 }, 500); 
            setTimeout(() => {$('.end_timer_section').css('visibility', 'hidden');},500);
            
            if(!answer_flag){
                answer_flag = true;
                iziToast.warning({  title: 'پایان زمان!',message: 'متاسفانه شما زمان را از دست دادید.',position: 'topRight',});
                question_id = $('.answer1').attr('question_id');
                $.ajax({
                    url: '/noghte/answer_api.php',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ phone: phone,question_id: question_id,action: 'no_answer' }),
                    success: function (result) {
                        if (result.status === 'success') {
                            $('#loading').css('display', 'flex');
                            $('.loading-text').text('لطفاً صبر کنید');
                            $('#loading').animate({ opacity: 1 }, 500); 
                            setTimeout(() => {
                                $('#loading').animate({ opacity: 0 }, 500); 
                                setTimeout(() => {$('#loading').css('display', 'none');},500);
                                
                                $('.score').text(result.updated_score);
                                $('.answer'+result.correct_answer.replace("a",'')).css('background', '#1fac00');


                            }, 500);
                            
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
            stat_checker_iterval = setInterval(() => {      
                $.ajax({
                    url: '/noghte/answer_api.php',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ action: 'get_next_question',question_id: parseInt(question_id)+1,phone:phone }),
                    success: function (result) {
                        if (result.status === 'success') {
                            if (result.ended !== undefined && result.ended !== null) {
                                if (result.ended === true) {
                                    clearInterval(stat_checker_iterval);
                                    end_competition(result);

                                }
                            }
                            if (result.is_next_question_ready === true) {
                                starting_remain_timer(parseInt(result.remaining/1000))
                                clearInterval(stat_checker_iterval);
                                $('#loading').css('display', 'flex');
                                $('.numberOfquestions_section').css('visibility', 'hidden');
                                $('.timer_text').css('visibility', 'visible');
                                $('.rules_section').css('visibility', 'hidden');
                                $('.container').css('display', 'none');
                                $('.loading-text').text('لطفاً صبر کنید');
                                $('#loading').animate({ opacity: 1 }, 500); 

                                setTimeout(() => {
                                    competition_started(result);   
                                }, result.remaining);
                            }
                            
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
            }, 7000);

        }
    }, 1000);
}

// after login  10~5 sec
function starting_remain_timer(duration){
    const $timer = $(".loading > .timer_section > .timer_number");

    $('#loading').css('display', 'flex');
    $('.loading-text').text('تا شروع مسابقه');
    // $('#loading').css('opacity', 0);
    // $('#loading').animate({ opacity: 1 }, 500); 

    let startremainingTime = duration;
    $timer.text(startremainingTime);

    const interval = setInterval(() => {
        startremainingTime--;
        $timer.text(startremainingTime);
        if (startremainingTime <= 0) {
            clearInterval(interval);
            // iziToast.success({
            //     title: 'start!',
            //     message: 'start.',
            //     position: 'topRight',
            // });
            $('#loading').animate({ opacity: 0 }, 500); 
            setTimeout(() => {$('#loading').css('display', 'none');},500);
        }
    }, 1000);
}