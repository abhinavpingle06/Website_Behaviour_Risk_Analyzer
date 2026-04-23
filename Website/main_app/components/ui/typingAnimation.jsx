import { TypeAnimation } from 'react-type-animation';

function TypingAnimation({
    sequence,
    speed = 50,
    wrapper = "span",
    repeat = Infinity
}) {
    return (
        <TypeAnimation
            sequence={sequence}
            speed={speed}
            wrapper={wrapper}
            repeat={repeat}
        />
    );
}

export default TypingAnimation;