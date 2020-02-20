let $;
const pageBanner_convertStepToMsg = (step) => {
    let msg = '';
    switch (step) {
        case 0:
            msg = '최고';
            break;
        case 1:
            msg = '좋음';
            break;
        case 2:
            msg = '양호';
            break;
        case 3:
            msg = '보통';
            break;
        case 4:
            msg = '나쁨';
            break;
        case 5:
            msg = '상당히 나쁨';
            break;
        case 6:
            msg = '매우 나쁨';
            break;
        case 7:
            msg = '최악';
            break;
    }
    return msg;
};
const pageBanner_stepToColor = (step) => {
    let msg = {backgroundColor: ''};
    switch (step) {
        case 0:
            msg.backgroundColor = 'rgb(28, 117, 211)';
            break;
        case 1:
            msg.backgroundColor = 'rgb(1, 156, 228)';
            break;
        case 2:
            msg.backgroundColor = 'rgb(0, 173, 196)';
            break;
        case 3:
            msg.backgroundColor = 'rgb(59, 140, 62)';
            break;
        case 4:
            msg.backgroundColor = 'rgb(251, 140, 0)';
            break;
        case 5:
            msg.backgroundColor = 'rgb(230, 74, 25)';
            break;
        case 6:
            msg.backgroundColor = 'rgb(213, 47, 47)';
            break;
        case 7:
            msg.backgroundColor = 'rgb(33, 33, 33)';
            break;
    }
    return msg;
};

const pagebanner = ({device, type, targetSelector}) => {
    if (window.$ === undefined) {
        const script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src",
            "https://genie.jupiterflow.com/static/vendor/jquery/jquery-3.4.1.min.js");
        if (script_tag.readyState) {
            script_tag.onreadystatechange = () => { // For old versions of IE
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    scriptLoadHandler(device, type, targetSelector);
                }
            };
        } else { // Other browsers
            script_tag.onload = () => {
                scriptLoadHandler(device, type, targetSelector);
            };
        }
        // Try to find the head, otherwise default to the documentElement
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        // The jQuery version on the window is the one we want to use
        $ = window.$;
        main(device, type, targetSelector);
    }
};

const scriptLoadHandler = (device, type, targetSelector) => {
    $ = window.$.noConflict(true);
    main(device, type, targetSelector);
};

const main = (device, type, targetSelector) => {
    $.ajax({
        type: 'post',
        url: 'https://genie.jupiterflow.com/device/data/download',
        data: {device: device},
        dataType: 'json'
    }).done((result) => {
        const record = result.data;

        const pm1_0_step = record[0].pm1_0_step;
        const pm2_5_step = record[0].pm2_5_step;
        const pm10_0_step = record[0].pm10_0_step;

        const cardCSS = {
            textAlign: 'center',
            color: 'white',
            background: '#fff',
            boxShadow: '0px 0px 25px rgba(0, 0, 0, 0.05)',
            // width: '251px',
            // height: '251px'
            position: 'relative',
            width: '100%',
            height: '100%',
            // paddingBottom: '25%'
        };
        const cardTitleCSS = {
            borderBottom: '1px solid #eee',
            padding: '15px 20px'
        };
        const cardBlockCSS = {
            padding: '10px 20px'
        };
        const pmStepCSS = {
            margin: 0,
            padding: 0,
            fontWeight: 700,
            letterSpacing: '-.1rem',
            lineHeight: 1.25,
            fontSize: '1.25em'
        };
        const pmStepImgCSS = {
            display: 'inline-block',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            width: '55%',
            paddingBottom: '65%',
            marginBottom: '10px'
        };

        const cardTitle = $(document.createElement('div'));
        cardTitle.css(cardTitleCSS);
        cardTitle.append($(document.createElement('div')).css(pmStepCSS));
        const cardBlock = $(document.createElement('div'));
        cardBlock.css(cardBlockCSS);
        cardBlock.append($(document.createElement('div')).css(pmStepImgCSS));
        cardBlock.append($(document.createElement('div')).css(pmStepCSS));

        switch (type) {
            case 'pm10_0':
                const pm10_0_section = $(document.createElement('div'));
                pm10_0_section.css(Object.assign({}, cardCSS, {display: 'inline-block'}, pageBanner_stepToColor(pm10_0_step)));
                pm10_0_section.append(cardTitle);
                pm10_0_section.children('div:nth-child(1)').children('div').html('미세먼지');
                pm10_0_section.append(cardBlock);
                pm10_0_section.children('div:nth-child(2)').children('div:nth-child(1)').css({backgroundImage: 'url(https://genie.jupiterflow.com/static/images/svg/step_' + pm10_0_step + '.svg)'});
                pm10_0_section.children('div:nth-child(2)').children('div:nth-child(2)').html(pageBanner_convertStepToMsg(pm10_0_step));
                $(targetSelector).html(pm10_0_section);
                break;
            case 'pm2_5':
                const pm2_5_section = $(document.createElement('div'));
                pm2_5_section.css(Object.assign({}, cardCSS, {display: 'inline-block'}, pageBanner_stepToColor(pm2_5_step)));
                pm2_5_section.append(cardTitle);
                pm2_5_section.children('div:nth-child(1)').children('div').html('초미세먼지');
                pm2_5_section.append(cardBlock);
                pm2_5_section.children('div:nth-child(2)').children('div:nth-child(1)').css({backgroundImage: 'url(https://genie.jupiterflow.com/static/images/svg/step_' + pm2_5_step + '.svg)'});
                pm2_5_section.children('div:nth-child(2)').children('div:nth-child(2)').html(pageBanner_convertStepToMsg(pm2_5_step));
                $(targetSelector).html(pm2_5_section);
                break;
            case 'pm1_0':
                const pm1_0_section = $(document.createElement('div'));
                pm1_0_section.css(Object.assign({}, cardCSS, {display: 'inline-block'}, pageBanner_stepToColor(pm1_0_step)));
                pm1_0_section.append(cardTitle);
                pm1_0_section.children('div:nth-child(1)').children('div').html('극미세먼지');
                pm1_0_section.append(cardBlock);
                pm1_0_section.children('div:nth-child(2)').children('div:nth-child(1)').css({backgroundImage: 'url(https://genie.jupiterflow.com/static/images/svg/step_' + pm1_0_step + '.svg)'});
                pm1_0_section.children('div:nth-child(2)').children('div:nth-child(2)').html(pageBanner_convertStepToMsg(pm1_0_step));
                $(targetSelector).html(pm1_0_section);
                break;
        };
    });
};