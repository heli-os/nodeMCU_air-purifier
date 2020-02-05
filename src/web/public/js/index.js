$(window).on('load', () => {
    $('.signin-form').validate({
        rules: {
            username: {required: true, minlength: 4, maxlength: 16},
            password: {required: true, minlength: 8, maxlength: 32}
        },
        messages: {
            username: {
                required: "Enter your username",
                minlength: jQuery.validator.format("Enter your username over {0} length"),
                maxlength: jQuery.validator.format("Enter your username under {0} length")
            },
            password: {
                required: "Enter your password",
                minlength: jQuery.validator.format("Enter your password over {0} length"),
                maxlength: jQuery.validator.format("Enter your password under {0} length")
            }
        },
        submitHandler: (frm) => {
            const queryString = $('.signin-form').serialize();
            console.log(queryString);
            $.ajax({
                type: 'post',
                url: '/authentication',
                data: queryString,
                dataType: 'json',
                error: (xhr, status, error) => {
                    console.log(error);
                },
                success: (json) => {
                    console.log(json);
                }

            });
            // frm.submit();
        },
        success: (e) => {
            // console.log(e);
        }
    });

    $('.signup-form').validate({
        rules: {
            username: {required: true, minlength: 4, maxlength: 16},
            email: {required: true, email: true, minlength: 8, maxlength: 254},
            password: {required: true, minlength: 8, maxlength: 32},
            password_repeat: {
                required: true,
                minlength: 8,
                maxlength: 32,
                equalTo: '.signup-form input[name=password]'
            },
            device: {required: true}
        },
        messages: {
            username: {
                required: "Enter your username",
                minlength: jQuery.validator.format("Enter your username over {0} length"),
                maxlength: jQuery.validator.format("Enter your username under {0} length")
            },
            email: {
                required: "Enter your email",
                minlength: jQuery.validator.format("Enter your username over {0} length"),
                maxlength: jQuery.validator.format("Enter your username under {0} length"),
                email: "Enter a valid email address"
            },
            password: {
                required: "Enter your password",
                minlength: jQuery.validator.format("Enter your password over {0} length"),
                maxlength: jQuery.validator.format("Enter your password under {0} length")
            },
            password_repeat: {
                required: "Enter your password",
                minlength: jQuery.validator.format("Enter your password over {0} length"),
                maxlength: jQuery.validator.format("Enter your password under {0} length"),
                equalTo: "Check your password"
            },
            device: {
                required: "Enter your Device ID"
            }
        },
        submitHandler: (frm) => {
            const queryString = $('.signup-form').serialize();
            console.log(queryString);
            $.ajax({
                type: 'post',
                url: '/authentication/new',
                data: queryString,
                dataType: 'json',
                error: (xhr, status, error) => {
                    console.log(error);
                },
                success: (json) => {
                    switch(json.state) {
                        case "SUCCESS" :
                            alert('a');
                            break;
                        case "FAIL" :
                            alert('b');
                            break;
                    }

                    console.log(json);
                }

            });
            // frm.submit();
        },
        success: (e) => {
            // console.log(e);
        }
    });

    $('.message a').on('click', () => {
        $('form').animate({
            height: "toggle",
            opacity: "toggle"
        }, "slow");
    });
});
