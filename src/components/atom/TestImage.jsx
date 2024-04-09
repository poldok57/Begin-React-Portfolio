import { withMousePosition } from "../../context/withMousePosition";

export const TestImage = ({ image_width }) => {
  return (
    <div className="group" style={{ width: image_width || "250px" }}>
      <img
        className="rounded-lg object-cover"
        src="/images/card-18-250.jpg"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div className="rounded bg-paper text-center opacity-20 group-hover:opacity-100">
        absolute image
      </div>
    </div>
  );
};

export const TestImageWP = withMousePosition(TestImage);
