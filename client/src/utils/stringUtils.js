export function capitalizeFirstLetter(str) {
    if (str.length === 0) {
      return ""; // Handle empty string case
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}