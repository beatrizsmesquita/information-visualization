# Prova de avalia��o
# Estatistica multivariada
# Capitulos:ACP,AF,AC
# Script para consulta

########################################
########################################
#
#Capitulo:  ACP
#
########################################
########################################
# Sec��o: ACP na pr�tica
#(exemplifica��o com o ficheiro FoodPriceUSA.txt
########################################
########################################
#LEITURA DOS DADOS:
dados<-read.table("FoodPriceUSA.txt",sep="\t",dec=",",header=TRUE)
dados
# primeira coluna ser o nome das linhas
dadosx<-dados[,-1]
rownames(dadosx)<-dados[,1]
dadosx


# ACP sobre dados n�o normalidados 
res1=prcomp(dadosx)   # Nota: o prcomp, por defeito, centraliza os dados
res1
( sum.res1=summary(res1) )

#Os individuos expressos nas novas CP's:
res1$x

#Grafico nas duas primeiras CP's

par(mfrow=c(1,2))
plot(res1$x[,1],res1$x[,2], type="n", xlab=paste(" CP1  (", (round(100*sum.res1$importance[2,1],digits=1)), " % )"),
ylab=paste(" CP2  (", (round(100*sum.res1$importance[2,2],digits=1)), " % )"), main="ACP (dados n�o normalizados) FoodPrice.xls")
text(res1$x[,1:2],lab=rownames(dadosx))


# ACP sobre dados normalizados
prcomp(dadosx, scale=TRUE)

# Correla��o entre as Variaveis originais e as CP's
cor(dadosxNormMatrix,res1$x)

# Constru��o de um biplot usando a fun��o "biplot"
a=prcomp(dadosx)
b=summary(a)
# biplot preservando a m�trica das colunas (biplot cl�ssico, segundo Gabriel)
biplot(a,choices=1:2, pch=15, cex=0.8,cex.axis=0.7,arrow.len = 0.05,xlab=paste(" CP1  (", (round(100*b$importance[2,1],digits=1)), " % )"),
ylab=paste(" CP2  (", (round(100*b$importance[2,2],digits=1)), " % )"),var.axes=TRUE, scale=1,  main="biplot cl�ssico")




########################################
########################################
#
#Capitulo: An�lise Fatorial 
#
########################################
########################################
# Sec��o: AF na pr�tica
#(exemplifica��o com o ficheiro DadosGarciaMarques2004.sav
########################################
########################################
#LEITURA DOS DADOS:
	install.packages("foreign")
	library(foreign)  # for reading data stored by SPSS

data<-read.spss("DadosGarciaMarques2004.sav", to.data.frame = TRUE)

#######
#Prepara��o dos dados
#Para considerar apenas dados n�o omissos usar:
datax <- data[complete.cases(data), ]

#eliminar a primeira coluna (n�o � variavel)
dados=data[,-1]

#######
#Modelo fatorial
	install.packages("psych")
	library(psych)
	install.packages("GPArotation")
	library(GPArotation)

###
#Extra��o dos fatores via ACP:
#para dados n�o normalizados
###
rMatrix<-cov(dados)
#Determina��o dos pesos factoriais
(AF<-principal(rMatrix, nfactors = 2,residuals = TRUE, rotate = "quartimax", covar=TRUE) )
#NOTA: "rotate" pode ser: "none", "varimax", "quartimax", "promax", "oblimin", "simplimax", "cluster"
###
#para dados normalizados usar
rMatrix<-cor(dados)

########
#Obten��o das estimativas das pontua��es (factor scores)
factor.scores(dados, f=AF , method = c("Bartlett"))

########
#Extra��o dos fatores via Maxima verosimilhan�a
AFmv=factanal(dados, factors=2, scores = c("Bartlett"), rotation = "varimax"); AFmv
#NOTA: "rotation" pode ser: "none" ou outra.
str(AFmv)

########
#Obten��o das estimativas das pontua��es (factor scores)
AFmv$scores
factor.scores(dados, f=AFmv, method = c("Bartlett"))


########
#Adequa��o do modelo fatorial
	install.packages("nFactors")
	library(nFactors) # to help determine the number of factors/components to retain
#Regras de determina��o do numero de factores a reter:
parallelAnalysis<-nScree(rMatrix)
parallelAnalysis
plotnScree(parallelAnalysis)

#C�lculo do KMO e MSA
print(KMO(dados),digits=3)

# Teste de Bartlett
cortest.bartlett(cor(dados),n=nrow(dados))





########################################
########################################
#
#Capitulo: An�lise de Clusters 
#
########################################
########################################
# Sec��o: AC na pr�tica
#(exemplifica��o com o ficheiro dieta.txt)
########################################
########################################
#LEITURA DOS DADOS:
dados=read.table("dieta.txt",sep="\t", header=TRUE)
dadosx=dados[,3:4]

#Visualizar dados (2 dimens�es)
plot(dadosx, main="dados dieta", xlab="before", ylab="after")


###################################
#  M�todos hierarquicos:
###################################
Mdistancia<-dist(dadosx, method="euclidian")
hc = hclust(Mdistancia, method="complete")
plot(hc,hang=-1, main="Distancia euclideana, e vizinho-mais-afastado")
#NOTA: a medida de distancia em "method" pode ser:
# "euclidean", "maximum", "manhattan", "canberra", "binary", "minkowski"
#NOTA: o criterio de agrega��o em "method" pode ser:
#"ward.D", "ward.D2", "single", "complete", "average", "mcquitty", "median", "centroid"

rect.hclust(hc,k=2)

cutree(hc, 2)

######################################
# M�todos n�o hier�rquicos
######################################
dados2G<-kmeans(dadosx, 2)
dados2G

#Visualizar os cluster da k-medias:
str(dados2G)
a=prcomp(dadosx)
plot(a$x[,1:2], col = dados2G$cluster, pch=19, main="kmeans, 2 grupos")
#OU
plot(dadosx, main="dados dieta", xlab="before", ylab="after", col=G2$cluster, pch=20)
points(G2$centers, pch=3, col="blue") # acrescentar os centroides

###########
# Avaliar os clusters
		install.packages("fpc")
		library(fpc)
res=cluster.stats(dist(dadosx),clustering=G2$cluster, alt.clustering=gender + 1)
res

#Obter apenas o ARI e o �ndice de Silhueta
resultadoIndices=matrix(c(res$corrected.rand,res$avg.silwidth),byrow=TRUE,1,2)
colnames(resultadoIndices)=c("ARI","avg.Silhw")
round(resultadoIndices, 3)

#Visualizer a silhueta (por exemplo, dos cluster obtidos no k-medias)
		install.packages("cluster")
		library(cluster)
D <- daisy(dadosx)
plot(silhouette(G2$cluster, D),col= c("blue", "purple"))

