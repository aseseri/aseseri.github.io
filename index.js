document.querySelectorAll(".project").forEach((el)=>{el.addEventListener("click", (e)=>{
        let link = "";
        switch (e.target.closest(".project").id){
            case "personal-website":
                link = "https://github.com/aseseri/aseseri.github.io";
                break;
            case "peach-party":
                link = "https://github.com/aseseri/Peach-Party-Project";
                break;
            case "interpreter":
                link = "https://github.com/aseseri/CS131-Brewer-Interpreter";
                break;
            case "networking":
                link = "https://github.com/aseseri/Reliable-and-Secure-Network-Communication-System";
                break;
            case "wnba":
                link = "WNBA/index.html";
                break;
        }
        window.open(link, "_blank"); //opens in new window
    });
})