import React, { useState, useRef, useEffect } from 'react';

import { PlayIcon, PauseIcon, BackwardIcon, ForwardIcon } from '@heroicons/react/24/solid';
import { supabase } from '../../../supabseClient';

import BaseLayout from '../BaseLayout';
import { DynamicComponent } from '../../components-registry';
import { PostLayout, PageComponentProps } from '@/types';

type ComponentProps = PageComponentProps & PostLayout;

const Component: React.FC<ComponentProps> = (props) => {
    const { global, ...page } = props;
    const { title, date, author, markdownContent, media, bottomSections = [] } = page;

    return (
        <BaseLayout {...props}>
            <main id="main" className="sb-layout sb-post-layout">
                <article className="px-4 py-14 lg:py-20">
                    <div className="max-w-5xl mx-auto">
                        <header className="mb-10 sm:mb-14">
                            <div className="uppercase mb-4 sm:mb-6"></div>
                            <h1>{title}</h1>
                        </header>
                        {markdownContent}
                        <MusicPlayer />
                    </div>
                </article>
                {bottomSections.length > 0 && (
                    <div>
                        {bottomSections.map((section, index) => {
                            return <DynamicComponent key={index} {...section} />;
                        })}
                    </div>
                )}
            </main>
        </BaseLayout>
    );
};
export default Component;

const MusicPlayer = () => {
    const [songs, setSongs] = useState([]); // State to hold songs fetched from Supabase
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);
    const progressRef = useRef(null); // Reference to the progress bar

    // Fetch the songs from Supabase
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const { data, error } = await supabase.from('songs').select('*');

                if (error) throw error;

                setSongs(data);
            } catch (error) {
                console.error('Error fetching songs:', error);
            }
        };

        fetchSongs();
    }, []);

    const playPauseHandler = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const nextSongHandler = () => {
        setCurrentSongIndex((prevIndex) => (prevIndex === songs.length - 1 ? 0 : prevIndex + 1));
        setIsPlaying(false);
        audioRef.current.load();
    };

    const prevSongHandler = () => {
        setCurrentSongIndex((prevIndex) => (prevIndex === 0 ? songs.length - 1 : prevIndex - 1));
        setIsPlaying(false);
        audioRef.current.load();
    };

    const updateProgress = () => {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setProgress((currentTime / duration) * 100);
    };

    // Handle user clicking on the progress bar
    const handleProgressClick = (e) => {
        const progressBar = progressRef.current;
        const width = progressBar.clientWidth; // Total width of the progress bar
        const offsetX = e.nativeEvent.offsetX; // Click position relative to the progress bar
        const duration = audioRef.current.duration;
        const newTime = (offsetX / width) * duration;
        audioRef.current.currentTime = newTime; // Set new current time
    };

    const handleSongSelection = (index) => {
        setCurrentSongIndex(index);
        setIsPlaying(false);
        audioRef.current.load();
    };

    function toTime(seconds) {
        var mins = Math.floor(seconds / 60);
        var extraSeconds = Math.floor(seconds % 60);
        return extraSeconds < 10 ? mins + ':0' + extraSeconds : mins + ':' + extraSeconds;
    }

    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play();
        }
    }, [currentSongIndex, isPlaying]);

    return (
        <div className="">
            {/* Music player */}
            <div className="bg-gradient-to-bl from-rose-300/50 to-gray-300/10 text-white p-6 rounded-lg shadow-md mx-auto mt-12">
                <div className="text-center mb-6">
                    <h3 className="font-semibold">{songs[currentSongIndex]?.title}</h3>
                    <h5 className="text-md text-gray-400">{songs[currentSongIndex]?.artist}</h5>
                </div>
                <audio ref={audioRef} src={songs[currentSongIndex]?.file_url} onTimeUpdate={updateProgress} onEnded={nextSongHandler}></audio>
                <div className="flex justify-center space-x-6 mb-6">
                    <button onClick={prevSongHandler} className="bg-gray-500 hover:bg-gray-600 text-white rounded-full px-4 py-2">
                        <BackwardIcon className="h-6 w-6" />
                    </button>
                    <button onClick={playPauseHandler} className="bg-gray-500 hover:bg-gray-600 text-white rounded-full px-4 py-2">
                        {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                    </button>
                    <button onClick={nextSongHandler} className="bg-gray-500 hover:bg-gray-600 text-white rounded-full px-4 py-2">
                        <ForwardIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-lg" ref={progressRef} onClick={handleProgressClick}>
                    <div className="bg-white h-2 rounded-lg" style={{ width: `${progress}%` }}></div>
                </div>
                {/* Time Information */}
                <div className="flex justify-between text-xs text-white mt-2">
                    <span>{Math.floor(audioRef.current?.currentTime || 0)}s</span>
                    <span>{Math.floor(audioRef.current?.duration || 0)}s</span>

                    {/* this is a work in progress, better time */}
                    {/* <span>{!audioRef.current ? toTime(audioRef.current.currentTime) : '0:00'}</span>
                    <span>{!audioRef.current ? toTime(audioRef.current.duration) : '0:00'}</span> */}
                </div>

                {/* Sidebar for Track List */}
                <div className=" text-white p-6 rounded-lg mx-auto mt-12">
                    <h3 className="text-lg font-bold mb-4">Available Tracks</h3>
                    <ul>
                        {songs.map((song, index) => (
                            <li
                                key={index}
                                onClick={() => handleSongSelection(index)}
                                className={`p-2 cursor-pointer rounded ${index === currentSongIndex ? 'bg-gray-600/50' : 'hover:bg-gray-700'}`}
                            >
                                {song.title} - <span className="text-gray-400">{song.artist}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
