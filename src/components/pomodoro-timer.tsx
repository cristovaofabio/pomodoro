import React, { useEffect, useState, useCallback } from "react";
import { useInterval } from "../hooks/use-interval";
import { formatTime } from "../utils/second-to-time";
import { Button } from "./button";
import { Timer } from "./timer";

const bellStart = require('../sounds/bell-start.mp3');
const bellFinish = require('../sounds/bell-finish.mp3');

const audioStartWorking = new Audio(bellStart);
const audioFinishWorking = new Audio(bellFinish);

interface Props {
    pomodoroTime: number;
    shortRestTime: number;
    longRestTime: number;
    cycles: number;
}

export function PomodoroTimer(props: Props): JSX.Element {
    const [mainTime, setMainTime] = useState(props.pomodoroTime);
    const [timeCounting, setTimeCounting] = useState(false);
    const [working, setWorking] = useState(false);
    const [resting, setResting] = useState(false);
    const [cyclesCountManager, setCyclesCountManager,] = useState(
        new Array(props.cycles).fill(true),
    );

    const [completedCycles, setCompletedCycles] = useState(0);
    const [fullWorkingTime, setFullWorkingTime] = useState(0);
    const [numberOfPomodoros, setNumberOfPomodoros] = useState(0);

    useInterval(() => {
        setMainTime(mainTime - 1);
        if (working) setFullWorkingTime(fullWorkingTime + 1);
    }, timeCounting ? 1000 : null);

    const configureWork = useCallback(() => {
        setTimeCounting(true);
        setWorking(true);
        setResting(false);
        setMainTime(props.pomodoroTime);
        audioStartWorking.play();
    }, [setTimeCounting, setWorking, setResting, setMainTime, props.pomodoroTime]);

    const configureRest = useCallback((Long: boolean) => {
        setTimeCounting(true);
        setWorking(false);
        setResting(true);

        if (Long) {
            setMainTime(props.longRestTime);
        } else {
            setMainTime(props.shortRestTime);
        }

        audioFinishWorking.play();
    }, [setTimeCounting, setWorking, setResting, setMainTime, props.longRestTime, props.shortRestTime]);

    useEffect(() => {
        if (working) {
            document.body.classList.remove('resting');
            document.body.classList.add('working');
        }
        if (resting) {
            document.body.classList.remove('working');
            document.body.classList.add('resting');
        }

        if (mainTime > 0) return;

        if (working && cyclesCountManager.length > 0) {
            configureRest(false);
            cyclesCountManager.pop();
        } else if (working && cyclesCountManager.length <= 0) {
            configureRest(true);
            setCyclesCountManager(new Array(props.cycles - 1).fill(true));
            setCompletedCycles(completedCycles + 1);
        }

        if (working) setNumberOfPomodoros(numberOfPomodoros + 1);
        if (resting) configureWork();

    }, [ working, resting, mainTime, cyclesCountManager, setCyclesCountManager,
        numberOfPomodoros, completedCycles, configureRest, configureWork, props.cycles,
    ]);

    return (
        <div className="pomodoro">
            <h2>Yeah!!!You are {working ? 'working': (resting ? 'resting' : 'stop')}!</h2>
            <Timer mainTime={mainTime}></Timer>

            <div className="controls">
                <Button text="Work" onClick={() => configureWork()}></Button>
                <Button text="Rest" onClick={() => configureRest(false)}></Button>
                <Button
                    className={!working && !resting ? 'hidden' : ''}
                    text={timeCounting ? 'Pause' : 'Play'}
                    onClick={() => setTimeCounting(!timeCounting)}></Button>
            </div>

            <div className="details">
                <p>Completed cycles: {completedCycles}</p>
                <p>Work time: {formatTime(fullWorkingTime)}</p>
                <p>Completed pomodoros: {numberOfPomodoros}</p>
            </div>
        </div>
    );
}
