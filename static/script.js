let btnSubmit = null;


document.addEventListener("DOMContentLoaded", function (event) {
    btnSubmit = document.getElementById('btnSubmit');
    window.getJsonParsed = async function () {
        btnSubmit.classList.add('is-loading');
        let url = document.getElementById('urlSpec').value;
        console.log('url :', url);

        // let response = await fetch(url);
        // let data = await response.json();
        // console.log('data :', data);

        response = await fetch('/build?l=' + url);
        data = await response.text();
        console.log('data2 :', data);

        // window.frames[0].frameElement.write(data);
        let frameDoc = document
            .getElementById('targetFrame')
            .contentDocument ||
            document
                .getElementById('targetFrame')
                .contentWindow
                .document;

        frameDoc
            .getElementsByTagName('body')[0]
            .innerHTML = "";

        document
            .getElementById('targetFrame')
            .contentDocument
            .write(data);

        this.setTimeout(() => {
            document
                .getElementById('targetFrame')
                .contentDocument
                .querySelectorAll('pre code')
                .forEach((block) => {
                    document
                        .getElementById('targetFrame')
                        .contentWindow
                        .hljs
                        .highlightBlock(block);
                });
        }, 2000);


        // window.frames[0].document.body.outerHTML = data;
        // previewContainer.innerHTML=data;
        btnSubmit.classList.remove('is-loading');



    };

    window.PrintFrame = () => {
        document
            .getElementById('targetFrame')
            .contentWindow
            .print()
    }

});


