import { withMousePosition } from "../windows/withMousePosition";
import Image from "next/image";
export const TestImage = ({ image_width }) => {
  return (
    <div className="group/testImage" style={{ width: image_width || "100%" }}>
      <Image
        className="object-cover rounded-lg"
        src="/images/card-18-250.jpg"
        alt="Description de l'image"
        layout="responsive"
        width={250}
        height={250}
      />
      <div className="text-center rounded opacity-20 bg-paper group-hover/testImage:opacity-100">
        absolute image
      </div>
    </div>
  );
};

export const TestImageWP = withMousePosition(TestImage);
