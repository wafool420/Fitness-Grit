import Svg, { Circle, Line } from "react-native-svg";

type DoodleSunProps = {
  size?: number;
};

export default function DoodleSun({ size = 28 }: DoodleSunProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {/* Sun center */}
      <Circle
        cx="16"
        cy="16"
        r="5"
        fill="#FFD84D"
        stroke="#151515"
        strokeWidth="1.5"
      />

      {/* Doodle rays */}
      <Line
        x1="16"
        y1="2"
        x2="16"
        y2="7"
        stroke="#151515"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Line
        x1="16"
        y1="25"
        x2="16"
        y2="30"
        stroke="#151515"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <Line
        x1="2"
        y1="16"
        x2="7"
        y2="16"
        stroke="#151515"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Line
        x1="25"
        y1="16"
        x2="30"
        y2="16"
        stroke="#151515"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <Line
        x1="6"
        y1="6"
        x2="9.5"
        y2="9.5"
        stroke="#151515"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Line
        x1="22.5"
        y1="22.5"
        x2="26"
        y2="26"
        stroke="#151515"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <Line
        x1="26"
        y1="6"
        x2="22.5"
        y2="9.5"
        stroke="#151515"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Line
        x1="9.5"
        y1="22.5"
        x2="6"
        y2="26"
        stroke="#151515"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
