(function(){
  const form = document.getElementById('transferForm')
  const message = document.getElementById('message')
  const modeScheduled = document.querySelector('[data-testid="mode-scheduled"]')
  const modeInstant = document.querySelector('[data-testid="mode-instant"]')
  const dateLabel = document.getElementById('dateLabel')
  const dateInput = document.querySelector('[data-testid="transfer-date"]')

  function showMessage(text, ok=true){
    message.textContent = text
    message.style.color = ok ? 'green' : 'red'
  }

  function validate(values){
    const errors = []
    if(!values.beneficiary) errors.push('Beneficiary required')
    if(!values.iban) errors.push('IBAN required')
    else if(!/^[a-zA-Z0-9]+$/.test(values.iban)) errors.push('IBAN alphanumeric')
    else if(values.iban.length < 14 || values.iban.length > 34) errors.push('IBAN length')
    if(!values.label) errors.push('Label required')
    else if(!/^[a-zA-Z0-9 ]+$/.test(values.label) || values.label.length > 255) errors.push('Label invalid')
    if(values.amount === '' || values.amount === null || isNaN(Number(values.amount))) errors.push('Amount required')
    else if(Number(values.amount) < 0.01 || Number(values.amount) > 100000) errors.push('Amount range')

    if(values.mode === 'scheduled'){
      if(!values.date) errors.push('Date required')
      else {
        const d = new Date(values.date)
        const today = new Date()
        today.setHours(0,0,0,0)
        const min = new Date(today)
        min.setDate(min.getDate()+1)
        const max = new Date(today)
        max.setDate(max.getDate()+90)
        if(d < min) errors.push('Date too early')
        if(d > max) errors.push('Date too late')
      }
    }

    return errors
  }

  function getFormValues(){
    return {
      beneficiary: form.querySelector('[data-testid="beneficiary-name"]').value.trim(),
      iban: form.querySelector('[data-testid="iban"]').value.trim(),
      label: form.querySelector('[data-testid="label"]').value.trim(),
      amount: form.querySelector('[data-testid="amount"]').value,
      mode: form.querySelector('[name="mode"]:checked').value,
      date: form.querySelector('[data-testid="transfer-date"]').value
    }
  }

  modeScheduled.addEventListener('change', () => {
    if(modeScheduled.checked) dateLabel.classList.remove('hidden')
  })
  modeInstant.addEventListener('change', () => {
    if(modeInstant.checked) dateLabel.classList.add('hidden')
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const values = getFormValues()
    const errors = validate(values)
    if(errors.length) {
      showMessage('Invalid: ' + errors.join(', '), false)
      return
    }
    // Simulate server-side RBAC: only Administrator or Purchase Manager allowed
    const currentRole = window.__ROLE__ || 'Guest'
    if(!['Administrator','Purchase Manager'].includes(currentRole)){
      showMessage('Access denied', false)
      return
    }

  showMessage('Transfer created successfully')
    form.reset()
    dateLabel.classList.add('hidden')
  })

  // helper to set min/max on date input when scheduled shown
  function setDateBounds(){
    const today = new Date()
    const min = new Date(today)
    min.setDate(min.getDate()+1)
    const max = new Date(today)
    max.setDate(max.getDate()+90)
    // format yyyy-mm-dd
    const fmt = d => d.toISOString().split('T')[0]
    dateInput.setAttribute('min', fmt(min))
    dateInput.setAttribute('max', fmt(max))
  }

  setDateBounds()
  // expose for tests
  window.__setRole = function(role){ window.__ROLE__ = role }
})()
