interface Props {
  title: string;
  items: string[][];
}

const InfoCard = ({
  title,
  items,
}: Props) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-5">
        {title}
      </h2>

      <div className="space-y-4">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between border-b pb-3"
          >
            <span className="text-gray-500">
              {label}
            </span>

            <span className="font-medium">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;