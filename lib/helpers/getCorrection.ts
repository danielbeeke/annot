export const getCorrection = (element: HTMLElement) => {
  let pointer: HTMLElement | null = element

  let marginLeft = 0
  let marginTop = 0

  while (pointer) {

    marginLeft += parseInt(window.getComputedStyle(pointer).marginLeft)
    marginTop += parseInt(window.getComputedStyle(pointer).marginTop)

    pointer = pointer.parentElement
  }

  return {
    marginLeft,
    marginTop
  }
}