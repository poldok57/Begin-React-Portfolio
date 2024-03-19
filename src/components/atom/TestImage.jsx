import { withMousePosition } from "../../context/withMousePosition";

export const TestImage = ({ image_width }) => {
  return (
    <div className="group">
      <img
        width={image_width || "250px"}
        className="rounded-lg object-cover"
        src="/images/card-18-250.jpg"
      />
      <div className="rounded bg-paper text-center opacity-20 group-hover:opacity-100">
        absolute image
      </div>
    </div>
  );
};

export const TestImageWP = withMousePosition(TestImage);
