import properties from '../data/properties.json';

export async function getAllProperties() {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return properties;
}

export async function getPropertyById(id) {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return properties.find((p) => p.id === Number(id)) || null;
}
