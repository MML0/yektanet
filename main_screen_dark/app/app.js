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

$(document).ready(function () {
    $.ajax({
        url: '/noghte/answer_api.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ action: 'get_next_question'}),
        success: function (result) {
            if (result.status === 'success') {
                if (result.ended === true) {
                    clearInterval(stat_checker_iterval);
                    end_competition(result);

                }
                if (result.started !== undefined && result.started !== null) {
                    if(result.started){
                        $('.loading-text').text('لطفاً صبر کنید.');
                        $('.rules_section').animate({ opacity: 0 }, 500); 
                        $('.vertical_line').animate({ opacity: 0 }, 500);
                        setTimeout(() => {
                            $('.rules_section').animate({ width: 0 }, 800); 
                            $('.vertical_line').animate({ width: 0 }, 200); 
                            $('.rules_section').css({ margin: 0 }); 
                            $('.vertical_line').css({ margin: 0 }); 
                            $('.rules_section').css({ padding: 0 }); 
                            $('.vertical_line').css({ padding: 0 }); 
                    
                        }, 500);
                    }
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

    show_next_question()
    //next_question_is_ready(result)

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
     
  
});



function show_next_question(){
    $('#loading').css('opacity', 0);
    $('#loading').css('display', 'flex');
    $('#loading').animate({ opacity: 1 }, 700); 

    
    question_id = $('.answer1').attr('question_id');
    
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
                        $('.timer_section').css('visibility', 'visible');
                        clearInterval(stat_checker_iterval);
                        next_question_is_ready(result);
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
    },  2000);
}

function next_question_is_ready(result){
    starting_remain_timer(parseInt(result.remaining/1000))
    setTimeout(() => {
        competition_started(result);
    }, result.remaining);
}

const result = {
    data: {
        correct:'1',
        text: "پرترافیک ترین ساعات بازدید کاربران از وبسایت های ایرانی از طریق تلفن همراه چه ساعاتی است؟",
        a1: "دستشوئی و استحمام",
        a2: "ورزش",
        a3: "خوردن صبحانه",
        a4: "چک کردن شبکه های اجتماعی"
    },
    current_question: 1,
    remaining:1000
};

function competition_started(result) {
    
    setTimeout(() => {
        $('.answer'+ result.data.correct.replace("a",'')).css('background', '#08c105').css('color', '#ffffff');
    }, 15000 + 1800);


    $('.question_box .text_q_js').text(result.data.text);
    $('.answer1').text(result.data.a1);
    $('.answer2').text(result.data.a2);
    $('.answer3').text(result.data.a3);
    $('.answer4').text(result.data.a4);
    $('.explanations_text').text(result.data.explanation);
    $('.answer_text').text(result.data[result.data.correct]);

    $('.answer').attr('question_id',result.current_question);
    $('.answer').css('background', '#21212199');
    $('.answer').css('color', '#ffffff');
    start_timer();
    //$('.container').css('display', 'flex');
    $('#loading').animate({ opacity: 0 }, 500); 
    setTimeout(() => {$('#loading').css('display', 'none');},500); 
    $('.container').animate({ opacity: 1 }, 500); 

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
    console.log('end');
    $.ajax({
        url: '/noghte/scoreboard_data.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ password: 'admin' }),
        success: function (result) {
            if (result.status === 'success') {
                console.log(result);
                users = result.top_10_users
                users.forEach((user, index) => {
                    user.name = user.first_name + ' ' + user.last_name;
                    delete user.id;
                    //user.score += Math.floor(Math.random() * 100); 
                });  
                $('.name').html('<div class="label_end">نام</div>'+users[0].name);
                $('.id').html('<div class="label_end">id</div>'+users[0].phone);
                $('.avatar img').attr('src',users[0].avatar);
            
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

    $('.avatar , .id ,.name ').css({ opacity: 0 }); 

    setTimeout(function() {
        $('#loading').animate({ opacity: 0 }, 800); 
        setTimeout(() => {$('#loading').css('display', 'none');},800);   
    }, 1200);
    setTimeout(() => {
        $('.end_comp_winer').css('display', 'flex');
        $('.end_comp_winer').animate({ opacity: 1 }, 200); 
    }, 3000);
    setTimeout(() => {
        $('.user').css('display', 'flex');
        $('.user').animate({ opacity: 1 }, 600); 

    }, 4000);
    setTimeout(() => {
        $('.avatar , .id ,.name ').animate({ opacity: 1 }, 800); 
    }, 6000);
    


}
function show_explanations() {

    $('.answers_box').animate({ opacity: 0 }, 500); 
    setTimeout(() => {
        $('.answers_box').css('display', 'none');
        $('.explanations_box').css('display', 'flex');
    },500);  
    
    
    $('.explanations_box').css({ opacity: 0 }); 
    setTimeout(() => {$('.explanations_box').animate({ opacity: 1 }, 500); },1200);
}
function show_graph_svg() {

    if($('.answer').attr('question_id')!=3){
        $('.svg_graph img').attr('src','/noghte/main_screen_dark/app/Q'+$('.answer').attr('question_id')+'.svg?v=4'); 
    }else{
        $('.loading-text').text('لطفاً صبر کنید.');
        $('#loading').css('opacity', 0);
        $('#loading').css('display', 'flex');
        $('.timer_section').css('visibility', 'hidden');
        $('#loading').animate({ opacity: 1 }, 700); 
        $('.answers_box').animate({ opacity: 0 }, 700); 
        $('.container').animate({ opacity: 0 }, 700); 
        $('.svg_graph').css({ opacity: 0 }); 
        return
    }
    $('.answers_box').animate({ opacity: 0 }, 700); 
    $('.container').animate({ opacity: 0 }, 700); 
    $('.svg_graph').css({ opacity: 0 }); 

    setTimeout(() => {
        $('.container').css('display', 'none');
        $('.answers_box').css('display', 'none');
    },710);  
    

    setTimeout(() => {
        $('.svg_graph').css('display', 'flex');
        $('.svg_graph').animate({ opacity: 1 }, 700); 
     },1200);
}
// for each question 20 sec
function start_timer(){
    const duration = 16; 
    const $container = $(".container");
    $container.show();
    remainingTime = duration;



    // setTimeout(() => {
    //     show_explanations()
    // }, 1000);

    const interval = setInterval(() => {
        remainingTime--;
        if (remainingTime <= 0) {
            clearInterval(interval);
            //$timer.text("  ");
            //iziToast.warning({  title: 'پایان زمان!',message: 'متاسفانه شما زمان را از دست دادید.',position: 'topRight',});
            question_id = $('.answer1').attr('question_id');
            setTimeout(() => {
                //show_explanations()
            }, 7000);

            setTimeout(() => {
                show_graph_svg()
            }, 7000);
            setTimeout(() => {
                $('.loading-text').text('لطفاً صبر کنید.');
                $('.timer_section').css('visibility', 'hidden');
                $('.svg_graph').animate({ opacity: 0 }, 500); 

                $('.container').animate({ opacity: 0 }, 500); 
                setTimeout(() => {
                    $('.container').css('display', 'none');
                },500);  
                setTimeout(() => {
                    $('.answers_box').animate({ opacity: 1 }, 500); 
                    $('.answers_box').css('display', 'grid');
                    $('.explanations_box').css('display', 'none');
                    $('.svg_graph').css('display', 'none');

                },1000);  
                
                $('.answer').css('background', '#21212199');
                $('.answer').css('color', '#ffffff');
                show_next_question()

            }, 40000);

        }
    }, 1000);
}

// after login  10~5 sec
function starting_remain_timer(duration){
    const $timer = $(".loading_content > .timer_section > .timer_number");
    

    $('.rules_section').animate({ opacity: 0 }, 500); 
    $('.vertical_line').animate({ opacity: 0 }, 500);

    setTimeout(() => {
        $('.rules_section').animate({ width: 0 }, 800); 
        $('.vertical_line').animate({ width: 0 }, 200); 
        $('.rules_section').css({ margin: 0 }); 
        $('.vertical_line').css({ margin: 0 }); 
        $('.rules_section').css({ padding: 0 }); 
        $('.vertical_line').css({ padding: 0 }); 

    }, 500);
    $('.timer_section').css('visibility', 'visible');
    //$('.rules_section').css('visibility', 'hidden');


    $('#loading').css('display', 'flex');
    //$('.loading-text').text('تا شروع مسابقه');
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