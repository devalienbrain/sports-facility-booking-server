import { TFacility } from "./facility.interface";
import { Facility } from "./facility.model";

const createFacility = async (
  payload: Partial<TFacility>
): Promise<TFacility> => {
  const facility = new Facility(payload);
  await facility.save();
  return facility;
};

const updateFacility = async (
  id: string,
  payload: Partial<TFacility>
): Promise<TFacility | null> => {
  const facility = await Facility.findByIdAndUpdate(id, payload, { new: true });
  return facility;
};

const deleteFacility = async (id: string): Promise<TFacility | null> => {
  const facility = await Facility.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return facility;
};

const getAllFacilities = async (): Promise<TFacility[]> => {
  return await Facility.find({ isDeleted: false });
};

export const FacilityService = {
  createFacility,
  updateFacility,
  deleteFacility,
  getAllFacilities,
};
