import { PlaceRoom } from "@/components/room/types";
import { usePlaceStore } from "@/lib/stores/places";
import { format } from "date-fns";
import { Archive, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { GiPokerHand } from "react-icons/gi";

import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import { useRoomStore } from "@/lib/stores/room";
import { cn } from "@/lib/utils/cn";
import { menuRoomVariants } from "@/styles/menu-variants";
import { useMemo, useState } from "react";

interface PlaceCreatProps {
  className?: string;
  handleClose: () => void;
  onPlaceSelected?: () => void;
  include?: boolean;
}

export const PlaceCreat: React.FC<PlaceCreatProps> = ({
  className,
  handleClose,
  onPlaceSelected,
  include = false,
}) => {
  const {
    places,
    addPlace,
    addOrUpdatePlace,
    deletePlace,
    setCurrentPlaceId,
    currentPlaceId,
  } = usePlaceStore();
  const [editingPlace, setEditingPlace] = useState<PlaceRoom | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [formData, setFormData] = useState<Partial<PlaceRoom>>({
    name: "",
    title: "",
    startDate: undefined,
    endDate: undefined,
    isActive: true,
    isPokerEvent: false,
  });
  const { setStoreName, resetRoom } = useRoomStore();

  // Add 7 hours to the current date to avoid archiving events that end after midnight
  const today = new Date();
  // if hour is less than 7, delete one day
  if (today.getHours() < 7) {
    today.setDate(today.getDate() - 1);
  }
  // around day at 00:00
  today.setHours(0, 0, 0, 0);

  // Function to check if an event has passed
  const isEventPassed = (place: PlaceRoom): boolean => {
    if (!place.endDate) return false;

    if (new Date(place.endDate) < today) {
      // console.log("place ", place.name, " end date", place.endDate);
      return true;
    }
    return false;
  };

  const totalPlaces = places.length;

  // Filter and sort places according to the criteria
  const sortedPlaces = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter according to the mode (archive or normal)
    const filteredPlaces = isArchiveMode
      ? places.filter((place) => isEventPassed(place))
      : places.filter((place) => !isEventPassed(place));

    // Separate places with and without start date
    const withStartDate = filteredPlaces.filter((place) => place.startDate);
    const withoutStartDate = filteredPlaces.filter((place) => !place.startDate);

    // Sort places with start date chronologically
    const sortedWithStartDate = withStartDate.sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    // Combine the two lists (first the ones with date, then the permanent ones)
    return [...sortedWithStartDate, ...withoutStartDate];
  }, [places, isArchiveMode]);

  const handleAddPlace = () => {
    setEditingPlace(null);
    setShowForm(true);
    setFormData({
      name: "",
      title: "",
      startDate: undefined,
      endDate: undefined,
      isActive: true,
      isPokerEvent: false,
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
      isPokerEvent: place.isPokerEvent,
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
      isPokerEvent: false,
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
      isPokerEvent: false,
    });
  };

  const handleDeletePlace = (placeId: string) => {
    resetRoom(placeId);
    deletePlace(placeId);
    if (placeId === currentPlaceId) {
      setCurrentPlaceId(null);
    }
  };

  const handleSelectPlace = (placeId: string) => {
    setStoreName(placeId);
    setCurrentPlaceId(placeId);
    if (onPlaceSelected) {
      onPlaceSelected();
    }
    handleClose();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Permanente";
    return format(new Date(date), "dd/MM/yyyy");
  };

  const toggleArchiveMode = () => {
    setIsArchiveMode(!isArchiveMode);
  };

  return (
    <div
      className={menuRoomVariants({
        width: 72,
        zIndex: include ? "none" : undefined,
        className,
      })}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-nowrap">Rooms manager</h2>
        {(editingPlace || showForm) && (
          <button className="btn btn-sm btn-ghost" onClick={handleCancel}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Button to toggle between normal and archive mode */}
      {sortedPlaces.length < totalPlaces && (
        <div className="mb-4">
          <button
            className={cn(
              "w-full btn btn-sm",
              isArchiveMode ? "btn-warning" : "btn-outline"
            )}
            onClick={toggleArchiveMode}
          >
            {isArchiveMode ? (
              <>
                <RotateCcw size={16} className="mr-2" />
                Back to active rooms
              </>
            ) : (
              <>
                <Archive size={16} className="mr-2" />
                See the archives
              </>
            )}
          </button>
        </div>
      )}

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
              <span className="label-text">Poker Event</span>
              <input
                type="checkbox"
                className={`toggle ${
                  formData.isPokerEvent
                    ? "toggle-primary border-2 border-primary"
                    : "bg-gray-400 border-2 border-gray-400"
                }`}
                checked={formData.isPokerEvent}
                onChange={(e) =>
                  setFormData({ ...formData, isPokerEvent: e.target.checked })
                }
              />
            </label>
          </div>

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

      {sortedPlaces.length === 0 && !showForm && (
        <div className="py-4 text-center text-gray-500">
          {isArchiveMode ? "No archived rooms found" : "No active rooms found"}
        </div>
      )}

      <div className="space-y-4">
        {sortedPlaces.map((place) => (
          <div
            key={place.id}
            className={cn(
              "flex justify-between items-center p-3 rounded-lg bg-base-200",
              {
                "bg-primary/10 border-2 border-primary shadow-md ring-2 ring-primary/30 ring-offset-1":
                  place.id === currentPlaceId,
              }
            )}
          >
            <div className="flex-1" onClick={() => handleSelectPlace(place.id)}>
              <div className="flex gap-2 items-center">
                <h3 className="font-semibold text-nowrap">{place.name}</h3>
                {place.isPokerEvent && (
                  <span title="Poker Event">
                    <GiPokerHand size={16} className="text-primary" />
                  </span>
                )}
              </div>
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
                onConfirm={() => {
                  handleDeletePlace(place.id);
                }}
                position="left"
                confirmMessage="Delete this room ?"
                confirmClassName="btn btn-sm btn-warning text-warning-content text-nowrap"
                className="btn btn-sm btn-ghost text-error text-nowrap"
              >
                <Trash2 size={16} />
              </DeleteWithConfirm>
            </div>
          </div>
        ))}
      </div>

      {!showForm && places.length > 0 && !isArchiveMode && (
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
