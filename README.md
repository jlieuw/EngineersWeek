
1. **Start the docker compose file.**
    ```
    docker compose up -d
    ```

1. **Download the Ollama models.** We'll use the `all-minilm` model for embeddings and the `tinyllama` model for reasoning.

    ```
    docker compose exec ollama ollama pull all-minilm
    docker compose exec ollama ollama pull tinyllama
    ```

### Create a table, run a vectorizer, and perform semantic search

1. **Connect to the database in your local developer environment**
   The easiest way connect to the database is with the following command:
   `docker compose exec -it db psql`. 
   
   Alternatively, you can connect to the database with the following connection string: `postgres://postgres:postgres@localhost:5432/postgres`.

1. **Enable pgai on your database**

    ```sql
    CREATE EXTENSION IF NOT EXISTS ai CASCADE;
    ```
    
1. **Create a table with the data you want to embed from a huggingface dataset**

    We'll create a table named `wiki` from a few rows of the english-language `wikimedia/wikipedia` dataset.
    
    First, we'll create the table:

    ```sql
    CREATE TABLE wiki (
        id      TEXT PRIMARY KEY,
        url     TEXT,
        title   TEXT,
        text    TEXT
    );
    ```

    Then, we'll load the data from the huggingface dataset:

    ```sql
    SELECT ai.load_dataset('wikimedia/wikipedia', '20231101.en', table_name=>'wiki', batch_size=>5, max_batches=>1, if_table_exists=>'append');
    ```
    
    Related documentation: [load dataset from huggingface](/docs/utils/load_dataset_from_huggingface.md).

1. **Create a vectorizer for `wiki`**

    To enable semantic search on the `wiki` table, we need to create vector embeddings for the `text` column.
    We use a vectorizer to automatically create these embeddings and keep them in sync with the data in the  `wiki` table.
    
    ```sql
    SELECT ai.create_vectorizer(
         'wiki'::regclass,
         destination => 'wiki_embeddings',
         embedding => ai.embedding_ollama('all-minilm', 384),
         chunking => ai.chunking_recursive_character_text_splitter('text')
    );
    ```
    
     Related documentation: [vectorizer usage guide](/docs/vectorizer/overview.md) and [vectorizer API reference](/docs/vectorizer/api-reference.md).

1. **Check the progress of the vectorizer embedding creation**

    ```sql
    select * from ai.vectorizer_status;
    ```
    <details>
    <summary>Click to see the output</summary>
    
    | id | source_table | target_table | view | pending_items |
    |----|--------------|--------------|------|---------------|
    | 1 | public.wiki | public.wiki_embeddings_store | public.wiki_embeddings | 10000 |
    
    </details>
    
    All the embeddings have been created when the `pending_items` column is 0. This may take a few minutes as the model is running locally and not on a GPU.
    
1. **Search the embeddings**

    We'll search the embeddings for the concept of "properties of light" even though these words are not in the text of the articles. This is possible because vector embeddings capture the semantic meaning of the text.
    
    Semantic search is a powerful feature in its own right, but it is also a key component of Retrieval Augmented Generation (RAG).

    ```sql
    SELECT title, chunk
    FROM wiki_embeddings 
    ORDER BY embedding <=> ai.ollama_embed('all-minilm', 'properties of light')
    LIMIT 1;
    ```
    <details>
    <summary>Click to see the output</summary>

    | title | chunk |
    |-------|-------|
    | Albedo |  Water reflects light very differently from typical terrestrial materials. The reflectivity of a water surface is calculated using the Fresnel equations.... |
    </details>
     
    This query selects from the `wiki_embeddings` view, which is created by the vectorizer and joins the embeddings with the original data in the `wiki` table to give us the ability to search using the embeddings but still be able to access (or filter on) all the data in the original table (e.g. the `title` column).
    
    Note the `ai.ollama_embed` function is used to call the `all-minilm` model. This is part of pgai's  [model calling capabilities](#model-calling).