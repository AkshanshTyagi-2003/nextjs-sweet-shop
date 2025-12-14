export function validateSweet(data: any) {
  if (!data?.name || !data?.category || !data?.price || data.quantity == null) {
    return false;
  }
  return true;
}
