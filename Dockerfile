# Use a imagem oficial do PostgreSQL
FROM postgres:13

# Defina variáveis de ambiente para o nome do banco de dados e as credenciais
ENV POSTGRES_DB=mydatabase
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword

# Expõe a porta padrão do PostgreSQL
EXPOSE 5432
