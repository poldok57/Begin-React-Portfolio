import { withMousePosition } from "../src/context/withMousePosition";

export const TestImage = ({ image_width }) => {
  return (
    <div>
      <img
        width={image_width || "250px"}
        className="rounded-lg object-cover"
        src="/images/card-18-250.jpg"
      />
      <div className="bg-paper text-center opacity-20 hover:opacity-100">
        absolute image
      </div>
    </div>
  );
};

export const TestImageWithPosition = withMousePosition(TestImage);
