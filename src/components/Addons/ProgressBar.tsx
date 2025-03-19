import { Devvit, useInterval, useState } from '@devvit/public-api';

import Settings from '../../Settings.json';

interface ProgressBarProps {
  width: number;
  onComplete?: () => void;
}

export const ProgressBar = (props: ProgressBarProps): JSX.Element => {

  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime] = useState(Date.now());
  const drawingTime = Settings.drawTimeEasy || 60;
  const [percentage, setPercentage] = useState<number>(0);
  const {onComplete}  = props;

  useInterval(() => {
    setElapsedTime(Date.now() - startTime);
    const remainingTime = drawingTime * 1000 - elapsedTime;
    const remainingPercentage = (elapsedTime / (drawingTime * 1000)) * 100;
    setPercentage( remainingPercentage);

    console.log(remainingTime);
    console.log(remainingPercentage);


    if (remainingTime <= 0) if(onComplete) onComplete();
  }, 500).start();

  const barSize: Devvit.Blocks.SizePercent = `${percentage}%`;

  return (
    <zstack
      backgroundColor={Settings.theme.shadow}
      height="16px"
      width={`${props.width}px`}
      alignment="start middle"
    >
      <hstack
        backgroundColor={Settings.theme.primary}
        height="100%"
        width={barSize}
      />
    </zstack>
  );
};
