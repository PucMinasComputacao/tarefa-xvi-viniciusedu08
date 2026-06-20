async function carregarGrafico() {
  const resposta = await fetch("/carreira");
  const carreira = await resposta.json();

  const clubes = carreira.map((item) => item.clube);
  const periodos = carreira.map((item) => item.periodo);
  const gols = carreira.map((item) => item.gols);
  const assistencias = carreira.map((item) => item.assistencias);
  const jogos = carreira.map((item) => item.jogos);
  const titulos = carreira.map((item) => item.titulos);

  const ctx = document.getElementById("graficoCarreira");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: clubes.map((clube, index) => `${clube} (${periodos[index]})`),
      datasets: [
        {
          label: "Jogos",
          data: jogos,
        },
        {
          label: "Gols",
          data: gols,
        },
        {
          label: "Assistências",
          data: assistencias,
        },
        {
          label: "Títulos",
          data: titulos,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Estatísticas da carreira de Neymar Jr",
        },
      },
    },
  });
}

carregarGrafico();
