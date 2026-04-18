type PendingOpen = {
    fullSrc: string
    altText: string
    titleText: string
} | null

const thumbImages = Array.from(
    document.querySelectorAll<HTMLImageElement>('.zoomable-image[data-full], .gallery-img[data-full]')
)

const imageModalEl = document.getElementById('imageModal') as HTMLElement
const modalImg = document.getElementById('imageModalImg') as HTMLImageElement
const modalLoading = document.getElementById('imageModalLoading') as HTMLElement
const modalTitle = document.getElementById('imageModalLabel') as HTMLElement

const imageModal = new (window as any).bootstrap.Modal(imageModalEl)

let thumbsRemaining = thumbImages.length
let thumbsReady = thumbImages.length === 0
let pendingOpen: PendingOpen = null

function markThumbSettled() {
    thumbsRemaining -= 1
    if (thumbsRemaining <= 0) {
        thumbsReady = true

        if (pendingOpen) {
            openFullImage(
                pendingOpen.fullSrc,
                pendingOpen.altText,
                pendingOpen.titleText
            )
            pendingOpen = null
        }
    }
}

thumbImages.forEach((img) => {
    if (img.complete) {
        markThumbSettled()
    } else {
        img.addEventListener('load', markThumbSettled, { once: true })
        img.addEventListener('error', markThumbSettled, { once: true })
    }

    const clickable =
        (img.closest('.gallery-card') as HTMLElement | null) ?? img

    clickable.addEventListener('click', () => {
        const fullSrc = img.dataset.full
        if (!fullSrc) return

        const altText = img.alt || ''
        const titleText =
            img.closest('.card')
                ?.querySelector('.card-body .h5')
                ?.textContent?.trim()
            || img.dataset.title
            || 'Campus Image'

        if (!thumbsReady) {
            pendingOpen = { fullSrc, altText, titleText }

            imageModal.show()
            modalTitle.textContent = titleText
            modalLoading.textContent = 'Waiting for thumbnails to finish loading…'
            modalLoading.classList.remove('d-none')
            modalImg.classList.add('d-none')
            modalImg.removeAttribute('src')
            modalImg.alt = ''
            return
        }

        openFullImage(fullSrc, altText, titleText)
    })
})

function openFullImage(
    fullSrc: string,
    altText: string,
    titleText: string
) {
    imageModal.show()

    modalTitle.textContent = titleText
    modalLoading.textContent = 'Loading full image…'
    modalLoading.classList.remove('d-none')
    modalImg.classList.add('d-none')
    modalImg.removeAttribute('src')
    modalImg.alt = altText

    const full = new Image()
    full.decoding = 'async'

    full.onload = () => {
        modalImg.src = fullSrc
        modalImg.alt = altText
        modalLoading.classList.add('d-none')
        modalImg.classList.remove('d-none')
    }

    full.onerror = () => {
        modalLoading.textContent = 'Could not load full image.'
    }

    full.src = fullSrc
}

imageModalEl.addEventListener('hidden.bs.modal', () => {
    modalImg.removeAttribute('src')
    modalImg.alt = ''
    modalImg.classList.add('d-none')
    modalLoading.textContent = 'Loading full image…'
    modalLoading.classList.remove('d-none')
})