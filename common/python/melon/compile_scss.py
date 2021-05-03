import importlib.util
import sys
import os
import json
import pip

def compile():
    if len(sys.argv) != 2:
        raise Exception("Mapping file is required.")

    import sass

    f = open(os.path.join(os.getcwd(), sys.argv[1]))
        
    print("Parsing SCSS mappings...")
    
    data = json.load(f)
    f.close()

    for (fr, to) in data.items():
        print("");

        path = os.path.join(os.getcwd(), fr)
        out_path = os.path.join(os.getcwd(), to)

        print(f"Compiling {fr}...")

        compiled = sass.compile(
            filename=path, 
            output_style='expanded', 
            source_comments=True, 
            source_map_contents=True,
            omit_source_map_url=True
        )

        print(f"Writing to {to}...\n")

        out = open(out_path, "w")
        out.write(compiled)
        out.close()

def prerequisite_check():
    installed = importlib.util.find_spec("sass")
    if installed == None:
        pip.main(['install', 'libsass'])

def main():
    prerequisite_check()
    compile()
    print("Successfully compiled.")

if __name__ == "__main__":
    main()