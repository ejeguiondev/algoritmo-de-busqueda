/*
Creado por Javier Muñiz @javianmuniz para
el canal de YouTube "Programar es increíble"

Suscríbete para más vídeos y tutoriales:
https://www.youtube.com/channel/UCS9KSwTM3FO2Ovv83W98GTg

Enlace al tutorial paso a paso:
https://youtu.be/NWS-_VsMab4
*/


var canvas;
var ctx;
var FPS = 50;

//ESCENARIO / TABLERO
var columnas = 25;
var filas = 25;
var escenario;  //matriz del nivel

//TILES
var anchoT;
var altoT;

const muro = '#000000';
const tierra = '#777777';


//RUTA
var principio;
var fin;

var openSet = [];
var closedSet = [];

var camino = [];
var terminado = false;




//CREAMOS UN ARRAY 2D
function creaArray2D(){
  let obj = [
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]

  return obj;
}

function heuristica(a,b){
  var x = Math.abs(a.x - b.x);
  var y = Math.abs(a.y - b.y);

  var dist = x+y;

  return dist;
}


function borraDelArray(array,elemento){
  for(i=array.length-1; i>=0; i--){
    if(array[i] == elemento){
      array.splice(i,1);
    }
  }
}





function Casilla(x,y,es){

  //POSICIÓN
  this.x = x;
  this.y = y;
  this.es = es

  //TIPO (obstáculo=1, vacío=0)
  this.tipo = 0;

  if (es[this.y][this.x] === 0){
    this.tipo = 0
  } else {
    this.tipo = 1
  }

  //PESOS
  this.f = 0;  //coste total (g+h)
  this.g = 0;  //pasos dados
  this.h = 0;  //heurística (estimación de lo que queda)

  this.vecinos = [];
  this.padre = null;


  //MÉTODO QUE CALCULA SUS VECNIOS
  this.addVecinos = function(){
    if(this.x > 0)
      this.vecinos.push(escenario[this.y][this.x-1]);   //vecino izquierdo

    if(this.x < escenario[0].length-1)
      this.vecinos.push(escenario[this.y][this.x+1]);   //vecino derecho

    if(this.y > 0)
      this.vecinos.push(escenario[this.y-1][this.x]);   //vecino de arriba

    if(this.y < escenario.length-1)
      this.vecinos.push(escenario[this.y+1][this.x]); //vecino de abajo
  }
  console.log(this.vecinos)



  //MÉTODO QUE DIBUJA LA CASILLA
  this.dibuja = function(){
    var color;

    if(this.tipo == 0)
      color = tierra;

    if(this.tipo == 1)
      color = muro;

    //DIBUJAMOS EL CUADRO EN EL CANVAS
    ctx.fillStyle = color;
    ctx.fillRect(this.x*anchoT,this.y*altoT,anchoT,altoT);
  }



  //DIBUJA OPENSET
  this.dibujaOS = function(){
    ctx.fillStyle = '#008000';
    ctx.fillRect(this.x*anchoT,this.y*altoT,anchoT,altoT);

  }

  //DIBUJA CLOSEDSET
  this.dibujaCS = function(){
    ctx.fillStyle = '#800000';
    ctx.fillRect(this.x*anchoT,this.y*altoT,anchoT,altoT);
  }


  //DIBUJA CAMINO
  this.dibujaCamino = function(){
    ctx.fillStyle = '#00FFFF';  //cyan
    ctx.fillRect(this.x*anchoT,this.y*altoT,anchoT,altoT);
  }


}



function inicializa(){
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  //CREAMOS LA MATRIZ
  escenario = creaArray2D();

    //CALCULAMOS EL TAMAÑO DE LOS TILES (Proporcionalmente)
    anchoT = parseInt(canvas.width/escenario.length);
    altoT = parseInt(canvas.height/escenario[0].length);

    canvas.width = escenario[0].length * anchoT
    canvas.height = escenario.length * altoT

  //AÑADIMOS LOS OBJETOS CASILLAS
  for(i=0;i<escenario[0].length;i++){
    for(j=0;j<escenario.length;j++){
        escenario[i][j] = new Casilla(j,i,escenario)
    }
  }

  //AÑADIMOS LOS VECINOS
  for(i=0;i<escenario[0].length;i++){
    for(j=0;j<escenario.length;j++){
        escenario[i][j].addVecinos();
    }
  }

  //CREAMOS ORIGEN Y DESTINO DE LA RUTA
  principio = escenario[0][0]; //y x el cero ya cuenta como si fuera el 1
  fin = escenario[10][10]; //y x el cero ya cuenta como si fuera el 1

  //INICIALIZAMOS OPENSET
  openSet.push(principio);

  //EMPEZAMOS A EJECUTAR EL BUCLE PRINCIPAL
  principal()
}



function dibujaEscenario(){
  for(i=0;i<escenario[0].length;i++){
    for(j=0;j<escenario.length;j++){
        escenario[i][j].dibuja();
    }
  }

  //DIBUJA OPENSET
  for(i=0; i<openSet.length; i++){
    openSet[i].dibujaOS();
  }


  //DIBUJA CLOSEDSET
  for(i=0; i<closedSet.length; i++){
    closedSet[i].dibujaCS();
  }

  for(i=0; i<camino.length; i++){
    camino[i].dibujaCamino();
  }



}


function borraCanvas(){
  canvas.width = canvas.width;
  canvas.height = canvas.height;
}






function algoritmo(){

  //SEGUIMOS HASTA ENCONTRAR SOLUCIÓN
  if(terminado!=true){

    //SEGUIMOS SI HAY AlGO EN OPENSET
    if(openSet.length>0){
      var ganador = 0;  //índie o posición dentro del array openset del ganador

      //evaluamos que OpenSet tiene un menor coste / esfuerzo
      for(i=0; i<openSet.length; i++){
        if(openSet[i].f < openSet[ganador].f){
          ganador = i;
        }
      }

      //Analizamos la casilla ganadora
      var actual = openSet[ganador];

      //SI HEMOS LLEGADO AL FINAL BUSCAMOS EL CAMINO DE VUELTA
      if(actual === fin){

        var temporal = actual;
        camino.push(temporal);

        setInterval(() => {
          temporal = temporal.padre;
          camino.push(temporal);
        }, 100);

        console.log('camino encontrado');
        terminado = true;
      }

      //SI NO HEMOS LLEGADO AL FINAL, SEGUIMOS
      else{
        
        borraDelArray(openSet,actual);
        closedSet.push(actual);

        var vecinos = actual.vecinos;

        //RECORRO LOS VECINOS DE MI GANADOR
        for(i=0; i<vecinos.length; i++){
          var vecino = vecinos[i];

          //SI EL VECINO NO ESTÁ EN CLOSEDSET Y NO ES UNA PARED, HACEMOS LOS CÁLCULOS
          if(!closedSet.includes(vecino) && vecino.tipo!=1){
            var tempG = actual.g + 1;

            //si el vecino está en OpenSet y su peso es mayor
            if(openSet.includes(vecino)){
              if(tempG < vecino.g){
                vecino.g = tempG;     //camino más corto
              }
            }
            else{
              vecino.g = tempG;
              openSet.push(vecino);
            }

            //ACTUALIZAMOS VALORES
            vecino.h = heuristica(vecino,fin);
            vecino.f = vecino.g + vecino.h;

            //GUARDAMOS EL PADRE (DE DÓNDE VENIMOS)
            vecino.padre = actual;

          }

        }


      }





    }

    else{
      console.log('No hay un camino posible');
      terminado = true;   //el algoritmo ha terminado
    }



  }

}



function principal(){
  requestAnimationFrame(principal)
  algoritmo();
  borraCanvas();
  dibujaEscenario();
}
