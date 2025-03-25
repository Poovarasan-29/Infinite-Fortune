export default function BarLoading() {
  return (
    <div
      className="loading-container flex-row gap-2"
      style={{ filter: "blur(5px)" }}
    >
      <span className="bar-loader"></span>
      <span className="bar-loader"></span>
      <span className="bar-loader"></span>
    </div>
  );
}
