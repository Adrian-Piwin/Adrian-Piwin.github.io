window.addEventListener('load', function () {
    var keyboardImg = document.getElementById("home-img");
    var homeText = document.getElementById("home-text").childNodes;

    var keyboardSources = ["key-1", "key-2","key-3", "key-4","key-5", "key-6","key-7", "key-8","key-9"]

    function typeOut(elem, txt, text, index, elemIndex){

        // Add new letter 
        text += txt[elemIndex].charAt(index);
        elem[elemIndex].innerHTML = text;
        index++;

        // Change image to simulate typing
        if (txt[elemIndex].charAt(index) != " ")
            keyboardImg.src = "../assets/keys/" + keyboardSources[getRandomInt(keyboardSources.length)] + ".png";
        else
            keyboardImg.src = "../assets/keys/Space.png";

        if (index < txt[elemIndex].length){
            // Type next letter after delay
            setTimeout(function() {
                typeOut(elem, txt, text, index, elemIndex)
            }, 100);
        }else{
            // Add new text
            elemIndex++;
            if (elemIndex < elem.length){
                typeOut(elem, txt, "", 0, elemIndex);
            }
        }

        // Check if finished
        if (elemIndex == elem.length && index == txt[elemIndex-1].length)
            keyboardImg.src = "../assets/laptop.png";
    }

    // Return random int between 0-max-1
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    
    // Type out home page text
    typeOut([homeText[1], homeText[3]], ["Hey, I'm Adrian, a", "Fullstack Developer"], "", 0, 0);
})