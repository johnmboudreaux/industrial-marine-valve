(function () {
    "use strict"

    const contactForm = document.getElementById('contact-form')
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault()

        const formData = new FormData(contactForm)
        const name = formData.get('name')
        const from = formData.get('email')
        const subject = formData.get('subject')
        const text = formData.get('message')
        const city = formData.get('city')
        console.log('name', name)
        console.log('from', from)
        console.log('sub', subject)
        console.log('text', text)
        console.log('city', city)

        try {
            contactForm.querySelector('.loading').classList.remove('d-none')

            const response = await fetch('http://localhost:3000/api/v1/message-received', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ city, from, name, subject, text })
            })

            const data = await response.json()
            if (data.error) {
                throw new Error(data.error)
            }
            contactForm.querySelector('.loading').classList.add('d-none')
            contactForm.querySelector('.sent-message').classList.remove('d-none')
        } catch (error) {
            console.log(error)
            contactForm.querySelector('.error-message').classList.remove('d-none')
            return
        } finally {
            contactForm.querySelector('.loading').classList.add('d-none')
        }
    })

})()