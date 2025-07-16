import Gem from "../assets/itemicon_diamond_blue.png";

export interface GemIconProps {
  size?: number;
}

export function GemIcon({ size }: GemIconProps) {
  return (
    <img
      src={Gem}
      alt="Gems Icon"
      className="icon"
      style={{ width: size, height: size }}
    />
  );
}
