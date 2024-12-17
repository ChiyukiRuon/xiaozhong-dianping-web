import type { DirectiveBinding } from 'vue'

declare global {
    interface HTMLElement {
        _observer?: IntersectionObserver
    }
}

const intersectDirective = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const callback = binding.value
        if (typeof callback !== 'function') return

        let timer: number | null = null
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!timer) {
                    timer = window.setInterval(() => {
                        callback()
                    }, 500)
                }
            } else {
                if (timer) {
                    clearInterval(timer)
                    timer = null
                }
            }
        })

        observer.observe(el)
        el._observer = observer
    },
    unmounted(el: HTMLElement) {
        if (el._observer) {
            el._observer.disconnect()
            delete el._observer
        }
    }
}

export default intersectDirective
