import { usePlaceStore } from "@/lib/stores/places";
import { PlaceRoom } from "@/components/room/types";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import { useRoomStore } from "@/lib/stores/room";

interface PlaceCreatProps {
  className?: string;
  handleClose: () => void;
}

export const PlaceCreat: React.FC<PlaceCreatProps> = ({
  className,
  handleClose,
}) => {
  const { places, addPlace, addOrUpdatePlace, deletePlace, setCurrentPlaceId } =
    usePlaceStore();
  const [editingPlace, setEditingPlace] = useState<PlaceRoom | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PlaceRoom>>({
    name: "",
    title: "",
    startDate: undefined,
    endDate: undefined,
    isActive: true,
  });
  const { setStoreName } = useRoomStore();

  const handleAddPlace = () => {
    setEditingPlace(null);
    setShowForm(true);
    setFormData({
      name: "",
      title: "",
      startDate: undefined,
      endDate: undefined,
      isActive: true,
    });
  };

  const handleEditPlace = (place: PlaceRoom) => {
    setEditingPlace(place);
    setShowForm(true);
    setFormData({
      id: place.id,
      name: place.name,
      title: place.title,
      startDate: place.startDate,
      endDate: place.endDate,
      isActive: place.isActive,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlace) {
      addOrUpdatePlace(formData as PlaceRoom);
    } else {
      addPlace(formData as PlaceRoom);
    }
    setEditingPlace(null);
    setShowForm(false);
    setFormData({
      name: "",
      title: "",
      startDate: undefined,
      endDate: undefined,
      isActive: true,
    });
  };

  const handleCancel = () => {
    setEditingPlace(null);
    setShowForm(false);
    setFormData({
      name: "",
      title: "",
      startDate: undefined,
      endDate: undefined,
      isActive: true,
    });
  };

  const handleSelectPlace = (placeId: string) => {
    setStoreName(placeId);
    setCurrentPlaceId(placeId);
    handleClose();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Permanente";
    return format(new Date(date), "dd/MM/yyyy");
  };

  return (
    <div
      className={cn("p-4 rounded-lg shadow-xl bg-base-100 min-w-72", className)}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-nowrap">Rooms manager</h2>
        {(editingPlace || showForm) && (
          <button className="btn btn-sm btn-ghost" onClick={handleCancel}>
            <X size={16} />
          </button>
        )}
      </div>

      {(showForm || !places.length) && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Title (optional)</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter a title"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Start Date (optional)</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={
                formData.startDate
                  ? format(new Date(formData.startDate), "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startDate: e.target.value
                    ? new Date(e.target.value)
                    : undefined,
                })
              }
            />
          </div>

          {formData.startDate && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">End Date (optional)</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={
                  formData.endDate
                    ? format(new Date(formData.endDate), "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endDate: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                min={format(new Date(formData.startDate), "yyyy-MM-dd")}
              />
            </div>
          )}

          <div className="form-control">
            <label className="cursor-pointer label">
              <span className="label-text">Active</span>
              <input
                type="checkbox"
                className="toggle"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="flex-1 btn btn-primary">
              {editingPlace ? "Update" : "Add"} Room
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {places.map((place) => (
          <div
            key={place.id}
            className="flex justify-between items-center p-3 rounded-lg bg-base-200"
          >
            <div className="flex-1" onClick={() => handleSelectPlace(place.id)}>
              <h3 className="font-semibold text-nowrap">{place.name}</h3>
              {place.title && (
                <div className="text-sm italic text-gray-500">
                  {place.title}
                </div>
              )}
              <div className="text-sm text-gray-600">
                {place.startDate ? (
                  <>
                    Du {formatDate(place.startDate)} au{" "}
                    {formatDate(place.endDate ?? null)}
                  </>
                ) : (
                  "Room permanente"
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => handleEditPlace(place)}
              >
                <Pencil size={16} />
              </button>

              <DeleteWithConfirm
                onConfirm={() => deletePlace(place.id)}
                confirmMessage="Delete this room ?"
                className="btn btn-sm btn-ghost text-error text-nowrap"
              >
                <Trash2 size={16} />
              </DeleteWithConfirm>
            </div>
          </div>
        ))}
      </div>

      {!showForm && places.length > 0 && (
        <button
          className="p-2 mt-4 w-full btn btn-primary"
          onClick={handleAddPlace}
        >
          <Plus size={16} className="mr-2" />
          Add a Room
        </button>
      )}
    </div>
  );
};
