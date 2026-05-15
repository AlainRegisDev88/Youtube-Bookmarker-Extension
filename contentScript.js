(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo;
    let currentVideoBookmarks = [];
    let bookmarkBtnAdded = false;

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type, value, videoId} = obj;

        if(type ==='NEW'){
            currentVideo = videoId;
            bookmarkBtnAdded = false;
            newVideoLoaded()
        } else if(type === 'PLAY'){
            youtubePlayer.currentTime = value;
        }else if(type=== 'DELETE'){
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
            chrome.storage.sync.set( {[currentVideo]: JSON.stringify(currentVideoBookmarks) })

            response(currentVideoBookmarks);

        }

    });

    const fetchBookmarks = () => {
        return new Promise ((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]): []);
            });
        });
    }

    const newVideoLoaded = async () => {
        if (bookmarkBtnAdded) return;
        
        const bookmarkBtnExists = document.getElementsByClassName('bookmark-btn')[0]
        currentVideoBookmarks = await fetchBookmarks();

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement('img');

            bookmarkBtn.src = chrome.runtime.getURL('assets/bookmark.png');
            bookmarkBtn.className = 'ytp-button '+ 'bookmark-btn';
            bookmarkBtn.title = 'Click to bookmark current timestamp';

            youtubeLeftControls = document.getElementsByClassName('ytp-left-controls')[0]
            youtubePlayer = document.getElementsByClassName('video-stream')[0]

            if (youtubeLeftControls && youtubePlayer) {
                youtubeLeftControls.appendChild(bookmarkBtn);
                bookmarkBtn.addEventListener('click', addNewBookmarkEventHandler);
                bookmarkBtnAdded = true;
            }

        } 

    }
    
    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: 'Bookmark at ' + getTime(currentTime),
        };
        
        currentVideoBookmarks = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a,b) => a.time - b.time))
        })

    };

    newVideoLoaded();
})();

function getTime(t){
    const date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substring(11, 19);
};