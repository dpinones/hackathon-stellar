# Documento de Requisitos

## Introducción
La función de Lotería de ARS implementa un sistema de lotería gamificado y descentralizado en la aplicación Currency Clash Arena, centrado exclusivamente en la volatilidad del ARS (Peso Argentino) frente al USD. Los usuarios apuestan tokens de testnet para predecir si el ARS subirá (>+0.05%), bajará (<-0.05%) o se mantendrá estable (entre -0.05% y +0.05%) en un intervalo de 5 minutos, validado por el oráculo Reflector. Esto crea una experiencia adictiva y simple para un hackathon, con rondas rápidas y resolución automática, eliminando el concepto de "boletos" para que los usuarios apuesten directamente la cantidad de tokens deseada.

El propósito es maximizar la simplicidad para un MVP funcional: solo una divisa (ARS, la más volátil), tres opciones de predicción, y acciones limitadas a apostar y reclamar.

## Requisitos

### Requisito 1: Visualización de la Pantalla Principal
**Historia de Usuario:** Como jugador, quiero ver la ronda actual y detalles relevantes, para entender el estado de la lotería y decidir apostar.

#### Criterios de Aceptación
1. CUANDO el usuario accede a la pantalla principal, ENTONCES el sistema DEBERÁ mostrar el número de ronda actual y el temporizador de cuenta regresiva (e.g., "3:10 minutos restantes"). El valor inicial de ARS se obtendrá al inicio de la ronda y el final al pasar los 5 minutos.

### Requisito 2: Mecanismo de Apostar
**Historia de Usuario:** Como jugador, quiero apostar tokens para predecir el movimiento del ARS, para participar en la lotería de la ronda siguiente.

#### Criterios de Aceptación
1. CUANDO el usuario selecciona "Apostar", ENTONCES el sistema DEBERÁ permitir elegir una opción (Sube, Baja, Estable), ingresar el monto en tokens y confirmar la apuesta.
2. MIENTRAS la ronda está abierta para apuestas, EL sistema DEBERÁ agregar los tokens al pool correspondiente (Sube, Baja, o Estable) y actualizar los porcentajes de apuestas en tiempo real.
3. CUANDO se confirma la apuesta, ENTONCES el sistema DEBERÁ escrow los tokens vía contrato inteligente y mostrar confirmación (e.g., "10 tokens en Baja para Ronda 43").

### Requisito 3: Integración con el Oráculo y Resolución de Ronda
**Historia de Usuario:** Como jugador, quiero una resolución automática basada en datos reales, para que los resultados sean justos y transparentes.

#### Criterios de Aceptación
1. CUANDO inicia la ronda, ENTONCES el sistema DEBERÁ fetch el valor inicial de ARS del oráculo Reflector (e.g., 0.000733 USD).
2. SI el fetch del oráculo falla (e.g., timeout >10s), ENTONCES el sistema DEBERÁ cancelar la ronda, reembolsar apuestas y notificar a los usuarios.
3. MIENTRAS el intervalo de 5 minutos transcurre, EL sistema DEBERÁ mantener el pool de apuestas bloqueado.
4. CUANDO finaliza el intervalo, ENTONCES el sistema DEBERÁ fetch el nuevo valor de ARS, calcular % cambio ((nuevo - inicial)/inicial * 100), y determinar el resultado: Sube (>+0.05%), Baja (<-0.05%), o Estable (entre -0.05% y +0.05%).
5. SI hay empate en el umbral (e.g., exactamente +0.05%), ENTONCES el sistema DEBERÁ clasificarlo como Estable por defecto.

### Requisito 4: Distribución de Ganancias y Reclamo
**Historia de Usuario:** Como jugador, quiero reclamar mis ganancias fácilmente, para recibir recompensas tras una predicción correcta.

#### Criterios de Aceptación
1. CUANDO se resuelve la ronda, ENTONCES el sistema DEBERÁ identificar ganadores (e.g., todos en "Baja" si ARS bajó -0.546%) y calcular su porción proporcional del pool (minus 5% fee para la próxima ronda).
2. SI no hay apuestas en la opción ganadora, ENTONCES el sistema DEBERÁ llevar el pool a la ronda siguiente.
3. MIENTRAS las ganancias estén pendientes, EL sistema DEBERÁ activar el botón "Reclamar" en la pantalla principal.
4. CUANDO el usuario selecciona "Reclamar", ENTONCES el sistema DEBERÁ transferir tokens vía contrato inteligente y mostrar notificación (e.g., "Ganaste 23.75 tokens").
5. SI hay múltiples rondas pendientes, ENTONCES el sistema DEBERÁ permitir reclamos acumulativos.



⏺ Flujo del Contrato - Perspectiva del Usuario vs Backend

  👤 Perspectiva del Usuario

  1. Usuario A - Primera Apuesta

  Usuario A: "Apuesto 100 tokens que ARS sube"
  → Llama: place_bet(userA, Up, 100)
  → Ve: "Apuesta exitosa en ronda #1"

  2. Usuario B - Se Une a la Ronda

  Usuario B: "Apuesto 200 tokens que ARS baja"
  → Llama: place_bet(userB, Down, 200) 
  → Ve: "Apuesta exitosa en ronda #1"

  3. Pasan 5+ Minutos - Momento de Claim

  Usuario A: "Quiero mis ganancias"
  → Llama: claim_winnings()
  → Ve: "Recibiste 285 tokens" (si ganó)

  ⚙️ Qué Pasa Por Detrás

  1. Primera Apuesta de Usuario A

  place_bet(userA, Up, 100) {
    // Backend detecta: No hay ronda activa
    CurrentRound = None

    // AUTO-CREA RONDA:
    RoundCounter: 0 → 1
    CurrentRound = 1

    Round(1) = {
      round_number: 1,
      start_time: ahora,
      start_price: $0.001025 (del oracle),
      bets: [userA, Up, 100],
      up_pool: 100,
      total_pool: 100
    }

    // Escrow: 100 tokens userA → contrato
    return 1  // "Apuesta en ronda #1"
  }

  2. Segunda Apuesta de Usuario B

  place_bet(userB, Down, 200) {
    // Backend encuentra ronda activa
    CurrentRound = 1
    Round(1).start_time + 300 > ahora  // Aún acepta apuestas

    // ACTUALIZA RONDA EXISTENTE:
    Round(1) = {
      bets: [userA-Up-100, userB-Down-200],
      up_pool: 100,
      down_pool: 200,
      total_pool: 300
    }

    // Escrow: 200 tokens userB → contrato
    return 1  // "Apuesta en ronda #1"
  }

  3. Pasan 5 Minutos - Auto-Settlement

  claim_winnings(userA) {
    // AUTO-DETECTA RONDA LISTA:
    CurrentRound = 1
    Round(1).start_time + 300 < ahora  // >5min
    Round(1).is_settled = false        // No resuelta

    // AUTO-SETTLEMENT INTERNO:
    internal_settle_round(1) {
      end_price = $0.001076 (oracle a los 5min exactos)
      change = (1076-1025)/1025 * 10000 = 497 basis points
      change > 5  // ARS subió >0.05%

      winning_prediction = Up  // userA ganó!

      // DISTRIBUCIÓN:
      fee = 300 * 5% = 15 tokens (para contrato)
      distributable = 285 tokens

      // userA apostó 100 de 100 total en "Up" = 100% del pool ganador
      userA_winnings = (100 * 285) / 100 = 285 tokens

      UserWinnings(userA) = 285
      Round(1).is_settled = true
    }

    // CLAIM REAL:
    winnings = UserWinnings(userA) = 285
    UserWinnings(userA) = 0  // Clear

    // Transfer: contrato → userA (285 tokens)
    return 285
  }

  4. Usuario C Apuesta Después - Nueva Ronda

  place_bet(userC, Stable, 150) {
    // Backend detecta: Ronda actual está cerrada
    CurrentRound = 1
    Round(1).is_settled = true  // Ya resuelta

    // AUTO-CREA NUEVA RONDA:
    RoundCounter: 1 → 2
    CurrentRound = 2

    Round(2) = {
      round_number: 2,
      start_time: ahora,
      start_price: $0.001076 (precio actual),
      bets: [userC, Stable, 150]
    }

    return 2  // "Apuesta en ronda #2"
  }

  🔄 Ciclo Continuo

  Estado del Storage tras estos eventos:
  RoundCounter = 2          // 2 rondas creadas total
  CurrentRound = 2          // Ronda activa para apuestas
  Round(1) = {settled}      // Historia: ronda completada
  Round(2) = {active}       // Actual: acepta apuestas
  UserWinnings(userA) = 0   // Ya reclamó
  UserWinnings(userB) = 0   // Perdió, no tiene nada

  ✨ Magia del Auto-Settlement

  - Usuario no sabe: Que el settlement ocurrió automáticamente
  - Ve simplemente: "Recibí mis ganancias"
  - Backend maneja: Oracle, cálculos, distribución, nueva ronda
  - Resultado: Experiencia fluida sin dependencias externas

  El contrato es completamente autónomo - los usuarios solo apuestan y
  reclaman, todo lo demás es invisible.




 stellar contract invoke \
  --id CBOR3RRXFRXAYJH5B4JQC6BZTVJDRVXO2XHU4NCMQMG66M6GQUT4AJHM \
  --source-account bob \
  --network testnet \
  -- \
  get_current_round



