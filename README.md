Con la nueva implementación, el flujo es el siguiente:

  Flujo de Apuestas y Reclamos

  1. Iniciar/Unirse a una Batalla (start_battle)

  - Cualquier usuario puede llamar start_battle(pair, chosen_currency, amount)
  - Si no existe una batalla activa para ese par de monedas:
    - El primer usuario crea la batalla y establece los precios iniciales
    - Se registra el timestamp de inicio
  - Si ya existe una batalla activa para ese par:
    - El usuario se une como participante adicional
    - Usa los mismos precios iniciales y timestamp que el primer usuario
  - Los fondos del usuario se transfieren al contrato

  2. Periodo de Espera

  - La batalla dura exactamente 5 minutos desde que el primer usuario la inició
  - Durante este tiempo, más usuarios pueden unirse llamando start_battle
  - Cada usuario elige su moneda preferida (0 o 1) y cantidad a apostar

  3. Liquidación (settle_battle)

  - Cualquier usuario puede llamar settle_battle(pair) después de 5 minutos
  - El contrato:
    - Obtiene precios exactos del oráculo a los 5 minutos (start_time + 300)
    - Calcula cambios porcentuales de ambas monedas
    - Determina la moneda ganadora (mayor cambio porcentual)

  4. Distribución de Ganancias

  - Empate (diferencia < 0.05%): Todos recuperan su apuesta original
  - Hay ganador:
    - Los ganadores se reparten todo el pool proporcionalmente
    - Si apostaste X cantidad en la moneda ganadora, recibes (X * total_pool) / winning_pool
    - Los perdedores pierden sus fondos

  Ejemplo:

  - Usuario A: 100 tokens en moneda 0
  - Usuario B: 200 tokens en moneda 1
  - Usuario C: 300 tokens en moneda 0

  Si gana moneda 0:
  - Pool total: 600 tokens
  - Pool ganador: 400 tokens (A + C)
  - Usuario A recibe: (100 * 600) / 400 = 150 tokens
  - Usuario C recibe: (300 * 600) / 400 = 450 tokens
  - Usuario B pierde sus 200 tokens

  Ventajas del nuevo sistema:
  - Sin admin necesario
  - Múltiples participantes por batalla
  - El primer usuario inicia, cualquiera puede liquidar
  - Previene manipulación de precios (precio fijo a los 5 minutos exactos)