from flask import Flask , render_template, Response, abort
import os
import psycopg2
app = Flask(__name__)


# connection to the database
"""def get_connection():
    return psycopg2.connect(
        host="localhost", # to be potentially replaced
        database="tpc", # import_csv.py should have been launch one time 
        user="postgres", # to be potentially replaced
        password="" # to be replaced
    )"""

def get_connection():
    return psycopg2.connect(os.environ["DATABASE_URL"])

# to save the cookie message
app.secret_key = 'dev'

def format_piece_title(title, opus, no, mov):
    """auxiliary function that formats the title of a piece correctly for the plots"""

    # title followed by opus number
    parts = [f"{title}, Op. {opus}"]

    # in case there a number within the opus is precised
    if no and no is not None:
        parts.append(f"n°{no}")

    # in case there a mvoement number is precised
    if mov:
        parts.append(f"mvt {mov}")

    return " ".join(parts)

def get_titles_and_selection():
    """Auxiliary function that retrieves random pieces from the dataset, to be displayed in data_example.html and analyses.html
        It outputs 4 dictionnary : the first three contain information (title, opus number etc) about all the random pieces displayed 
        for each period ; the last one only that of the piece actually selectedby the user."""
    conn = get_connection()
    # cursor to execute sql requests 
    cur = conn.cursor()

    def get_period_titles(periode):
        # selecting 4 random titles, opus, no, mov to be formated later
        cur.execute("""
            SELECT title, opus, "no", mov, title_file
            FROM corpusfaurecomplete
            WHERE periode = %s
            ORDER BY random()
            LIMIT 4
        """, (periode,))

        rows = cur.fetchall()

        # for each period the retrieved information is contained in a dictionary
        return [
            {
                "title": r[0],
                "opus": str(r[1]).rstrip(".0"),
                "no": str(r[2]).rstrip(".0") if r[2] else "",
                "mov": r[3] or "",
                "title_file" : r[4],
                "display": format_piece_title(r[0], str(r[1]).rstrip(".0"), str(r[2]).rstrip(".0"), r[3])
            }
            for r in rows
        ]

    # we apply the function and retrieve a dictionnary for each period
    titles1 = get_period_titles(1)
    titles2 = get_period_titles(2)
    titles3 = get_period_titles(3)

    #  a default selection (first piece by alpphabetical order) to be displayed when the page is first opened (fallback)
    cur.execute("""
        SELECT title, opus, "no", mov, title_file
        FROM corpusfaurecomplete
        ORDER BY title
        LIMIT 1
    """)

    # the currently selected row in the dataset
    r = cur.fetchone()

    # dictionnary for the currently selected piece
    selected_piece = {
        "title": r[0],
        "opus": str(r[1]).rstrip(".0"),
        "no": str(r[2]).rstrip(".0") if r[2] else "",
        "mov": r[3] or "",
        "title_file" : r[4],
        "display": format_piece_title(r[0], str(r[1]).rstrip(".0"), str(r[2]).rstrip(".0"), r[3])
    }

    conn.close()

    return titles1, titles2, titles3, selected_piece

# to save the cookie message
app.secret_key = 'dev'

# routes to different pages
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/devlogs')
def devlogs():
    return render_template('devlogs.html')

@app.route('/contact')
def contacts():
    return render_template('contact.html')

@app.route("/analyses")
def analyses():
    titles1, titles2, titles3, selected_piece = get_titles_and_selection()

    return render_template(
        "analyses.html",
        titles1=titles1,
        titles2=titles2,
        titles3=titles3,
        selected_piece=selected_piece
    )


@app.route("/data_example")
def donnees():
    titles1, titles2, titles3, selected_piece = get_titles_and_selection()

    # added argument to get the appropriate svg plot (heatmap Tonnetz)
    svg_filename = f"plots/{selected_piece.get('title_file')}.svg"

    return render_template(
        "data_example.html",
        titles1=titles1,
        titles2=titles2,
        titles3=titles3,
        selected_piece=selected_piece,
        svg_filename=svg_filename
    )

# Related with analyses.html : routes to the various d3.js model comparison plots 
@app.route("/data/<title_file>")
def data_for_piece(title_file):
    # creating the right path to the data
    csv_path = os.path.join(app.root_path,"data", "distributions", f"{title_file}.csv")

    # if the path does not exist, abort raises a 404 error
    if not os.path.exists(csv_path):
        abort(404)

    # otherwise the function returns a Response object containing the data 
    with open(csv_path, encoding="utf-8") as f:
        return Response(f.read(), mimetype="text/csv")
    
# Render the 404 not found page 
@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)










