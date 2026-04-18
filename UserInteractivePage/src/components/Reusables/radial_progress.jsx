import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function ProgressCircle({ value, WnH }) {
    // Premium gradient colors based on risk level
    const getGradientColors = (val) => {
        if (val >= 90) {
            return {
                start: '#FF5A5F',
                end: '#FF3B40',
                trail: 'rgba(255, 90, 95, 0.1)'
            };
        } else if (val >= 75) {
            return {
                start: '#F4B740',
                end: '#FFA726',
                trail: 'rgba(244, 183, 64, 0.1)'
            };
        } else if (val >= 45) {
            return {
                start: '#4F8CFF',
                end: '#5AD7FF',
                trail: 'rgba(79, 140, 255, 0.1)'
            };
        } else {
            return {
                start: '#2ECC71',
                end: '#27AE60',
                trail: 'rgba(46, 204, 113, 0.1)'
            };
        }
    };

    const colors = getGradientColors(value);

    return (
        <div className={WnH}>
            <CircularProgressbar
                value={value}
                text={`${value}%`}
                styles={buildStyles({
                    pathColor: colors.start,
                    textColor: colors.start,
                    trailColor: colors.trail,
                    textSize: "22px",
                    pathTransitionDuration: 1.5,
                    strokeLinecap: 'round',
                })}
                strokeWidth={8}
            />
        </div>
    );
}