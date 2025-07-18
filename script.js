let currentSong = new Audio();
let songs
let play = document.querySelector("#play");
let songName = document.querySelector(".songName");
let SongTime = document.querySelector(".duration");
let currFolder;

function secondToMinutesSeconds(second) {
    if (isNaN(second) || second < 0) {
        return "00:00";
    }

    const minutes = Math.floor(second / 60);
    const remaingSecond = Math.floor(second % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remaingSecond).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}`);

    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}`)[1]);
        }
    }
    //show all songa in Play list
    let songsUl = document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songsUl.innerHTML = ""
    for (const song of songs) {
        songsUl.innerHTML =
            songsUl.innerHTML +
            `<li>
            <img class="invert" src="./img/music.svg" alt="">
                  <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                     
                  </div>
                  <div class="playnow">
                  <div>Play now</div>
                  <img class="invert" src="./img/play.svg" alt="">
                  </div>
                </li>
                `;

        // //Attach an add event Listener

        Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach((e) => {
            e.addEventListener("click", () => {
                const trackName = e.querySelector(".info").firstElementChild.innerHTML;
                playMusic(trackName);
                songName.innerHTML = trackName;
                play.src = "./img/pause.svg";
            });
        });
    }

      // event for next song

    let next = document.querySelector("#next")
    next.addEventListener("click", () => {
        console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            currentSong.pause()
            let nextSong = songs[index + 1]
            playMusic(nextSong)
            songName.innerHTML = nextSong.replaceAll("%20", " ").replaceAll(".mp3", "")
            play.src = "./img/pause.svg";
        }
    })


    // event for previuos song
    let previous = document.querySelector("#previous")
    previous.addEventListener("click", () => {
        console.log("previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) > 0) {
            let nextSong = songs[index - 1]
            playMusic(nextSong)
            songName.innerHTML = nextSong.replaceAll("%20", " ").replaceAll(".mp3", "")
            play.src = "./img/pause.svg";
        }
    })
}

const playMusic = (track) => {

    //play Frist song
    currentSong.src = `/${currFolder}` + track;
    currentSong.play();
};


async function displayAlbums() {
    try {
        const res = await fetch(`/songs`);
        const html = await res.text();

        const div = document.createElement("div");
        div.innerHTML = html;

        const anchors = Array.from(div.getElementsByTagName("a"));
        const cardContainer = document.querySelector(".card-container");
        cardContainer.innerHTML = ""; // Clear previous cards if needed

        for (const anchor of anchors) {
            const href = anchor.getAttribute("href");

            // Skip non-album folders
            if (!href.includes("/songs") || href.includes(".htaccess")) continue;

            // Extract folder name robustly
            const folder = href.split("/").filter(Boolean).pop();

            try {
                // Load album metadata
                const infoRes = await fetch(`/songs/${folder}/info.json`);
                const albumInfo = await infoRes.json();

                // Build and append card
                const cardHTML = `
                    <div data-folder="${folder}" class="card">
                        <div class="play"><i class="fa-solid fa-play"></i></div>
                        <img src="./songs/${folder}/cover.jpg" alt="${albumInfo.title}">
                        <h2>${albumInfo.title}</h2>
                        <p>${albumInfo.description || "Hits to boost your mood and fill you with happiness"}</p>
                    </div>`;
                cardContainer.innerHTML += cardHTML;

            } catch (err) {
                console.error(`Could not load album info for folder: ${folder}`, err);
            }
        }

        // Attach event listeners AFTER rendering all cards
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", async () => {
                const folder = card.dataset.folder;
                console.log("Album clicked:", folder);
                await getSongs(`songs/${folder}/`);
            });
        });

    } catch (error) {
        console.error("Error loading albums:", error);
    }
}


async function main() {
    await getSongs(`songs/mysongs/`);
    // console.log(songs)  

    //display all album on page
    displayAlbums()


    //  Attach an event Listener to pause play 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./img/pause.svg";
        } else if (currentSong.play) {
            play.src = "./img/play.svg";
            currentSong.pause();
        }
    });

    // listen for time update enent
    currentSong.addEventListener("timeupdate", () => {
        console.log((currentSong.currentTime, currentSong.duration));

        SongTime.innerHTML = `${secondToMinutesSeconds(
            currentSong.currentTime
        )}/ ${secondToMinutesSeconds(currentSong.duration)} `;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // listen to change the seek bar
    document.querySelector(".seek-bar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;

        let circle = document.querySelector(".circle");
        circle.style.left = percent * 100 + "%";
        circle.style.transition = "0.1s";
        currentSong.currentTime = currentSong.duration * percent;
    });

    //lister for hamgerger
    let hamburger = document.querySelector(".hamburger");
    hamburger.addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
        document.querySelectorAll(".songsList ul li img, .songsList ul li .playnow").forEach((element) => {
            element.style.display = "flex";
        });

    });

    //event for cross

    let cross = document.querySelector(".cross")
    cross.addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

  

    // event for controlling the volume
    let vol = document.querySelector(".range").getElementsByTagName("input")[0]
    vol.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        console.log(e.target.value)

        if (e.target.value <= 100 && e.target.value >= 70) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume-high"></i>`
        }

        else if (e.target.value < 70 && e.target.value >= 30) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume"></i>`
        }
        else if (e.target.value >= 1 && e.target.value < 30) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume-low"></i>`
        }
        else if (e.target.value == 0) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume-xmark"></i>`
        }
    })

   



}

main()