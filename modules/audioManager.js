import * as THREE from 'three';

export function setupAudio(camera) {

    const listener = new THREE.AudioListener();
    camera.add(listener);

    const bgMusic = new THREE.Audio(listener);
    const loader = new THREE.AudioLoader();

    let musicReady = false;
    let userWantsMusic = false;

    loader.load(
        'audio/0sound effects/nhac.mp3', // đổi nhạc ở đây
        (buffer) => {
            bgMusic.setBuffer(buffer);
            bgMusic.setLoop(true);
            bgMusic.setVolume(1);
            musicReady = true;

            if (userWantsMusic && !bgMusic.isPlaying) {
                bgMusic.play();
            }
        }
    );

    function play() {
        userWantsMusic = true;
        if (musicReady && !bgMusic.isPlaying) {
            bgMusic.play();
        }
    }

    function pause() {
        userWantsMusic = false;
        if (bgMusic.isPlaying) {
            bgMusic.pause();
        }
    }

    return { play, pause };
}